# UML Diagram Generation - Examples & Patterns

Complete examples showing different approaches to generating UML diagrams.

## Example 1: Complete Mermaid Generator with Tree-sitter

```typescript
// complete-mermaid-generator.ts
import Parser from 'web-tree-sitter';

interface ClassInfo {
  name: string;
  attributes: Attribute[];
  methods: Method[];
  interfaces: string[];
  parent?: string;
}

interface Attribute {
  visibility: string;
  name: string;
  type: string;
}

interface Method {
  visibility: string;
  name: string;
  parameters: Parameter[];
  returnType: string;
}

interface Parameter {
  name: string;
  type: string;
}

interface Relationship {
  from: string;
  to: string;
  type: 'inheritance' | 'implementation' | 'association' | 'composition' | 'aggregation';
  label?: string;
  fromMultiplicity?: string;
  toMultiplicity?: string;
}

export class CompleteMermaidGenerator {
  private classes: Map<string, ClassInfo> = new Map();
  private relationships: Relationship[] = [];

  public generateFromAST(rootNode: Parser.SyntaxNode): string {
    this.reset();
    this.extractInformation(rootNode);
    return this.generateMermaid();
  }

  private reset() {
    this.classes.clear();
    this.relationships = [];
  }

  private extractInformation(node: Parser.SyntaxNode) {
    this.extractClasses(node);
    this.extractRelationships(node);
  }

  private extractClasses(node: Parser.SyntaxNode) {
    if (node.type === 'class_declaration') {
      const classInfo = this.parseClass(node);
      this.classes.set(classInfo.name, classInfo);
    }

    if (node.type === 'interface_declaration') {
      const interfaceInfo = this.parseInterface(node);
      this.classes.set(interfaceInfo.name, interfaceInfo);
    }

    for (const child of node.children) {
      this.extractClasses(child);
    }
  }

  private parseClass(node: Parser.SyntaxNode): ClassInfo {
    const nameNode = node.childForFieldName('name');
    const name = nameNode?.text || 'Unknown';

    const attributes: Attribute[] = [];
    const methods: Method[] = [];
    const interfaces: string[] = [];
    let parent: string | undefined;

    // Parse inheritance
    const inheritanceNode = node.children.find(n => 
      n.type === 'inheritance' || n.type === 'extends_clause'
    );
    if (inheritanceNode) {
      const extendsNode = inheritanceNode.children.find(c => c.text === 'extends');
      if (extendsNode) {
        const parentNode = inheritanceNode.children.find(c => 
          c.type === 'identifier' || c.type === 'type_identifier'
        );
        parent = parentNode?.text;
      }

      const implementsNode = inheritanceNode.children.find(c => c.text === 'implements');
      if (implementsNode) {
        const interfaceNodes = inheritanceNode.children.filter(c => 
          c.type === 'identifier' || c.type === 'type_identifier'
        );
        interfaces.push(...interfaceNodes.map(n => n.text));
      }
    }

    // Parse members
    const bodyNode = node.children.find(n => 
      n.type === 'class_body' || n.type === 'declaration_list'
    );

    if (bodyNode) {
      for (const member of bodyNode.children) {
        if (member.type === 'attribute' || member.type === 'field_declaration') {
          attributes.push(this.parseAttribute(member));
        } else if (member.type === 'method' || member.type === 'method_declaration') {
          methods.push(this.parseMethod(member));
        }
      }
    }

    return { name, attributes, methods, interfaces, parent };
  }

  private parseInterface(node: Parser.SyntaxNode): ClassInfo {
    // Similar to parseClass but for interfaces
    const nameNode = node.childForFieldName('name');
    const name = nameNode?.text || 'Unknown';

    const methods: Method[] = [];

    const bodyNode = node.children.find(n => 
      n.type === 'interface_body' || n.type === 'declaration_list'
    );

    if (bodyNode) {
      for (const member of bodyNode.children) {
        if (member.type === 'method' || member.type === 'method_signature') {
          methods.push(this.parseMethod(member));
        }
      }
    }

    return { name, attributes: [], methods, interfaces: [] };
  }

  private parseAttribute(node: Parser.SyntaxNode): Attribute {
    const nameNode = node.childForFieldName('name');
    const typeNode = node.childForFieldName('type');
    
    const name = nameNode?.text || '';
    const type = typeNode?.text || 'any';
    const visibility = this.extractVisibility(node);

    return { visibility, name, type };
  }

  private parseMethod(node: Parser.SyntaxNode): Method {
    const nameNode = node.childForFieldName('name');
    const returnTypeNode = node.childForFieldName('return_type');
    
    const name = nameNode?.text || '';
    const returnType = returnTypeNode?.text || 'void';
    const visibility = this.extractVisibility(node);

    const parameters: Parameter[] = [];
    const parametersNode = node.children.find(n => 
      n.type === 'parameters' || n.type === 'parameter_list'
    );

    if (parametersNode) {
      for (const param of parametersNode.children) {
        if (param.type === 'parameter') {
          const paramName = param.childForFieldName('name')?.text || '';
          const paramType = param.childForFieldName('type')?.text || 'any';
          parameters.push({ name: paramName, type: paramType });
        }
      }
    }

    return { visibility, name, parameters, returnType };
  }

  private extractVisibility(node: Parser.SyntaxNode): string {
    const visibilityNode = node.children.find(n => 
      ['+', '-', '#', '~', 'public', 'private', 'protected'].includes(n.text)
    );

    const text = visibilityNode?.text || '+';

    // Convert word visibility to symbol
    const visibilityMap: Record<string, string> = {
      'public': '+',
      'private': '-',
      'protected': '#',
      'package': '~',
      '+': '+',
      '-': '-',
      '#': '#',
      '~': '~'
    };

    return visibilityMap[text] || '+';
  }

  private extractRelationships(node: Parser.SyntaxNode) {
    if (node.type === 'relationship_declaration' || node.type === 'relationship') {
      const relationship = this.parseRelationship(node);
      this.relationships.push(relationship);
    }

    for (const child of node.children) {
      this.extractRelationships(child);
    }
  }

  private parseRelationship(node: Parser.SyntaxNode): Relationship {
    const fromNode = node.childForFieldName('from') || node.childForFieldName('source');
    const toNode = node.childForFieldName('to') || node.childForFieldName('target');
    const arrowNode = node.childForFieldName('arrow') || node.childForFieldName('relationship_type');

    const from = fromNode?.text || '';
    const to = toNode?.text || '';
    const arrow = arrowNode?.text || '->';

    const arrowTypeMap: Record<string, Relationship['type']> = {
      '->': 'association',
      '<|--': 'inheritance',
      '..|>': 'implementation',
      '<|..': 'implementation',
      'o--': 'aggregation',
      '*--': 'composition',
      '-->': 'association',
      '--': 'association'
    };

    const type = arrowTypeMap[arrow] || 'association';

    // Extract label if present
    const labelNode = node.children.find(n => 
      n.type === 'string' || n.type === 'label'
    );
    const label = labelNode ? labelNode.text.replace(/["']/g, '') : undefined;

    // Extract multiplicities
    const fromMultNode = node.childForFieldName('from_multiplicity');
    const toMultNode = node.childForFieldName('to_multiplicity');
    
    const fromMultiplicity = fromMultNode?.text.replace(/["']/g, '');
    const toMultiplicity = toMultNode?.text.replace(/["']/g, '');

    return { 
      from, 
      to, 
      type, 
      label, 
      fromMultiplicity, 
      toMultiplicity 
    };
  }

  private generateMermaid(): string {
    const lines: string[] = ['classDiagram'];

    // Generate class/interface definitions
    for (const [name, classInfo] of this.classes) {
      this.generateClassDefinition(classInfo, lines);
    }

    // Generate inheritance from parent classes
    for (const [name, classInfo] of this.classes) {
      if (classInfo.parent) {
        lines.push(`  ${classInfo.parent} <|-- ${name}`);
      }

      for (const iface of classInfo.interfaces) {
        lines.push(`  ${iface} <|.. ${name}`);
      }
    }

    // Generate explicit relationships
    for (const rel of this.relationships) {
      this.generateRelationship(rel, lines);
    }

    return lines.join('\n');
  }

  private generateClassDefinition(classInfo: ClassInfo, lines: string[]) {
    lines.push(`  class ${classInfo.name} {`);

    // Add attributes
    if (classInfo.attributes.length > 0) {
      lines.push('    %% Attributes');
      for (const attr of classInfo.attributes) {
        lines.push(`    ${attr.visibility}${attr.type} ${attr.name}`);
      }
    }

    // Add methods
    if (classInfo.methods.length > 0) {
      if (classInfo.attributes.length > 0) {
        lines.push('    %% Methods');
      }
      for (const method of classInfo.methods) {
        const params = method.parameters
          .map(p => `${p.name}: ${p.type}`)
          .join(', ');
        lines.push(`    ${method.visibility}${method.name}(${params}) ${method.returnType}`);
      }
    }

    lines.push('  }');
    
    // Add interface note
    if (classInfo.interfaces.length === 0 && classInfo.attributes.length === 0) {
      lines.push(`  <<interface>> ${classInfo.name}`);
    }

    lines.push('');
  }

  private generateRelationship(rel: Relationship, lines: string[]) {
    const arrow = this.getMermaidArrow(rel.type);
    
    let relationshipLine = `  ${rel.from}`;
    
    if (rel.fromMultiplicity) {
      relationshipLine += ` "${rel.fromMultiplicity}"`;
    }
    
    relationshipLine += ` ${arrow}`;
    
    if (rel.toMultiplicity) {
      relationshipLine += ` "${rel.toMultiplicity}"`;
    }
    
    relationshipLine += ` ${rel.to}`;
    
    if (rel.label) {
      relationshipLine += ` : ${rel.label}`;
    }

    lines.push(relationshipLine);
  }

  private getMermaidArrow(type: Relationship['type']): string {
    const arrows: Record<Relationship['type'], string> = {
      'inheritance': '<|--',
      'implementation': '..|>',
      'association': '-->',
      'aggregation': 'o--',
      'composition': '*--'
    };

    return arrows[type];
  }
}

// Usage Example
async function example() {
  // Assume parser is initialized
  const parser = new Parser();
  // ... load language ...

  const sourceCode = `
    class User {
      - id: Number
      - name: String
      + getName(): String
    }

    class Order {
      - id: Number
      - total: Number
      + calculate(): Number
    }

    User "1" -> "0..*" Order : "places"
  `;

  const tree = parser.parse(sourceCode);
  const generator = new CompleteMermaidGenerator();
  const mermaidCode = generator.generateFromAST(tree.rootNode);

  console.log(mermaidCode);
}
```

## Example 2: Complete SVG Generator with Advanced Layout

```typescript
// complete-svg-generator.ts
interface Point { x: number; y: number; }
interface Size { width: number; height: number; }
interface Rect extends Point, Size {}

interface SVGClassBox {
  id: string;
  name: string;
  attributes: string[];
  methods: string[];
  bounds: Rect;
  isInterface: boolean;
}

interface SVGEdge {
  id: string;
  from: string;
  to: string;
  type: 'inheritance' | 'implementation' | 'association' | 'composition' | 'aggregation';
  label?: string;
  points: Point[];
}

interface SVGTheme {
  background: string;
  classBox: { fill: string; stroke: string; strokeWidth: number; };
  interfaceBox: { fill: string; stroke: string; strokeWidth: number; };
  text: { fontFamily: string; fontSize: number; color: string; };
  edge: { stroke: string; strokeWidth: number; };
  shadow: boolean;
}

export class CompleteSVGGenerator {
  private readonly THEMES: Record<string, SVGTheme> = {
    light: {
      background: '#ffffff',
      classBox: { fill: '#f0f8ff', stroke: '#4682b4', strokeWidth: 2 },
      interfaceBox: { fill: '#f0fff0', stroke: '#2e8b57', strokeWidth: 2 },
      text: { fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#000000' },
      edge: { stroke: '#696969', strokeWidth: 2 },
      shadow: true
    },
    dark: {
      background: '#1e1e1e',
      classBox: { fill: '#2d3748', stroke: '#4299e1', strokeWidth: 2 },
      interfaceBox: { fill: '#2f4f2f', stroke: '#48bb78', strokeWidth: 2 },
      text: { fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#e2e8f0' },
      edge: { stroke: '#a0aec0', strokeWidth: 2 },
      shadow: false
    }
  };

  private readonly CLASS_WIDTH = 220;
  private readonly CLASS_PADDING = 12;
  private readonly LINE_HEIGHT = 20;
  private readonly HEADER_HEIGHT = 35;
  private readonly HORIZONTAL_GAP = 120;
  private readonly VERTICAL_GAP = 100;

  private classes: Map<string, SVGClassBox> = new Map();
  private edges: SVGEdge[] = [];
  private theme: SVGTheme;

  constructor(themeName: string = 'light') {
    this.theme = this.THEMES[themeName] || this.THEMES.light;
  }

  public generateFromData(
    classes: Array<{ name: string; attributes: string[]; methods: string[]; isInterface?: boolean }>,
    relationships: Array<{ from: string; to: string; type: string; label?: string }>
  ): string {
    this.reset();
    this.buildClasses(classes);
    this.buildEdges(relationships);
    this.calculateLayout();
    return this.generateSVG();
  }

  private reset() {
    this.classes.clear();
    this.edges = [];
  }

  private buildClasses(
    classes: Array<{ name: string; attributes: string[]; methods: string[]; isInterface?: boolean }>
  ) {
    for (const cls of classes) {
      const box: SVGClassBox = {
        id: `class-${cls.name}`,
        name: cls.name,
        attributes: cls.attributes,
        methods: cls.methods,
        isInterface: cls.isInterface || false,
        bounds: { x: 0, y: 0, width: this.CLASS_WIDTH, height: 0 }
      };

      box.bounds.height = this.calculateClassHeight(box);
      this.classes.set(cls.name, box);
    }
  }

  private buildEdges(
    relationships: Array<{ from: string; to: string; type: string; label?: string }>
  ) {
    for (const rel of relationships) {
      const edge: SVGEdge = {
        id: `edge-${rel.from}-${rel.to}`,
        from: rel.from,
        to: rel.to,
        type: rel.type as any,
        label: rel.label,
        points: []
      };

      this.edges.push(edge);
    }
  }

  private calculateClassHeight(box: SVGClassBox): number {
    let height = this.HEADER_HEIGHT;
    
    if (box.attributes.length > 0) {
      height += this.CLASS_PADDING;
      height += box.attributes.length * this.LINE_HEIGHT;
      height += this.CLASS_PADDING;
    }

    if (box.methods.length > 0) {
      height += this.CLASS_PADDING;
      height += box.methods.length * this.LINE_HEIGHT;
      height += this.CLASS_PADDING;
    }

    return height;
  }

  private calculateLayout() {
    // Hierarchical layout for inheritance relationships
    const layers = this.buildInheritanceLayers();
    
    if (layers.length > 0) {
      this.applyHierarchicalLayout(layers);
    } else {
      this.applyGridLayout();
    }

    this.calculateEdgePaths();
  }

  private buildInheritanceLayers(): string[][] {
    const layers: string[][] = [];
    const placed = new Set<string>();
    const childToParent = new Map<string, string>();

    // Build parent-child map from inheritance edges
    for (const edge of this.edges) {
      if (edge.type === 'inheritance' || edge.type === 'implementation') {
        childToParent.set(edge.from, edge.to);
      }
    }

    // Find roots (classes with no parent)
    const roots = Array.from(this.classes.keys()).filter(name => 
      !childToParent.has(name)
    );

    if (roots.length === 0) return [];

    // Build layers using BFS
    let currentLayer = roots;
    
    while (currentLayer.length > 0) {
      layers.push(currentLayer);
      currentLayer.forEach(name => placed.add(name));

      const nextLayer: string[] = [];
      for (const [child, parent] of childToParent) {
        if (currentLayer.includes(parent) && !placed.has(child)) {
          nextLayer.push(child);
        }
      }

      currentLayer = nextLayer;
    }

    // Add remaining classes to last layer
    const remaining = Array.from(this.classes.keys()).filter(name => !placed.has(name));
    if (remaining.length > 0) {
      layers.push(remaining);
    }

    return layers;
  }

  private applyHierarchicalLayout(layers: string[][]) {
    const canvasWidth = this.calculateCanvasWidth();

    layers.forEach((layer, layerIndex) => {
      const totalWidth = layer.length * this.CLASS_WIDTH + (layer.length - 1) * this.HORIZONTAL_GAP;
      const startX = (canvasWidth - totalWidth) / 2;

      layer.forEach((className, index) => {
        const classBox = this.classes.get(className)!;
        classBox.bounds.x = startX + index * (this.CLASS_WIDTH + this.HORIZONTAL_GAP);
        classBox.bounds.y = 50 + layerIndex * (this.getMaxHeightInLayer(layer) + this.VERTICAL_GAP);
      });
    });
  }

  private getMaxHeightInLayer(layer: string[]): number {
    return Math.max(...layer.map(name => this.classes.get(name)!.bounds.height));
  }

  private applyGridLayout() {
    const classNames = Array.from(this.classes.keys());
    const cols = Math.ceil(Math.sqrt(classNames.length));

    classNames.forEach((name, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const classBox = this.classes.get(name)!;
      classBox.bounds.x = col * (this.CLASS_WIDTH + this.HORIZONTAL_GAP) + 50;
      classBox.bounds.y = row * (classBox.bounds.height + this.VERTICAL_GAP) + 50;
    });
  }

  private calculateCanvasWidth(): number {
    let maxClasses = 0;
    const layers = this.buildInheritanceLayers();
    
    for (const layer of layers) {
      maxClasses = Math.max(maxClasses, layer.length);
    }

    return maxClasses * this.CLASS_WIDTH + (maxClasses + 1) * this.HORIZONTAL_GAP;
  }

  private calculateEdgePaths() {
    for (const edge of this.edges) {
      const fromBox = this.classes.get(edge.from);
      const toBox = this.classes.get(edge.to);

      if (!fromBox || !toBox) continue;

      // Calculate connection points
      const fromPoint = this.getConnectionPoint(fromBox.bounds, toBox.bounds);
      const toPoint = this.getConnectionPoint(toBox.bounds, fromBox.bounds);

      edge.points = [fromPoint, toPoint];
    }
  }

  private getConnectionPoint(from: Rect, to: Rect): Point {
    const fromCenter = {
      x: from.x + from.width / 2,
      y: from.y + from.height / 2
    };

    const toCenter = {
      x: to.x + to.width / 2,
      y: to.y + to.height / 2
    };

    // Determine which edge to use based on relative position
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Use left or right edge
      return {
        x: dx > 0 ? from.x + from.width : from.x,
        y: fromCenter.y
      };
    } else {
      // Use top or bottom edge
      return {
        x: fromCenter.x,
        y: dy > 0 ? from.y + from.height : from.y
      };
    }
  }

  private generateSVG(): string {
    const { width, height } = this.calculateCanvasSize();

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Background
    svg += `<rect width="100%" height="100%" fill="${this.theme.background}"/>`;

    // Styles and markers
    svg += this.generateDefs();

    // Edges first (behind classes)
    for (const edge of this.edges) {
      svg += this.generateEdge(edge);
    }

    // Classes
    for (const classBox of this.classes.values()) {
      svg += this.generateClass(classBox);
    }

    svg += '</svg>';

    return svg;
  }

  private generateDefs(): string {
    return `
      <defs>
        <style>
          .class-box { fill: ${this.theme.classBox.fill}; stroke: ${this.theme.classBox.stroke}; stroke-width: ${this.theme.classBox.strokeWidth}; }
          .interface-box { fill: ${this.theme.interfaceBox.fill}; stroke: ${this.theme.interfaceBox.stroke}; stroke-width: ${this.theme.interfaceBox.strokeWidth}; }
          .class-name { font-family: ${this.theme.text.fontFamily}; font-size: ${this.theme.text.fontSize + 2}px; font-weight: bold; fill: ${this.theme.text.color}; }
          .interface-label { font-family: ${this.theme.text.fontFamily}; font-size: ${this.theme.text.fontSize - 2}px; font-style: italic; fill: ${this.theme.text.color}; }
          .member-text { font-family: Consolas, Monaco, monospace; font-size: ${this.theme.text.fontSize}px; fill: ${this.theme.text.color}; }
          .separator { stroke: ${this.theme.text.color}; stroke-width: 1; opacity: 0.3; }
          .edge { stroke: ${this.theme.edge.stroke}; stroke-width: ${this.theme.edge.strokeWidth}; fill: none; }
          .edge-label { font-family: ${this.theme.text.fontFamily}; font-size: ${this.theme.text.fontSize - 2}px; fill: ${this.theme.edge.stroke}; }
          ${this.theme.shadow ? '.class-box, .interface-box { filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)); }' : ''}
        </style>
        
        ${this.generateMarkers()}
      </defs>
    `;
  }

  private generateMarkers(): string {
    const color = this.theme.edge.stroke;
    
    return `
      <marker id="arrow-inheritance" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <polygon points="0 0, 12 6, 0 12" fill="none" stroke="${color}" stroke-width="2"/>
      </marker>
      <marker id="arrow-implementation" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <polygon points="0 0, 12 6, 0 12" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="3,3"/>
      </marker>
      <marker id="arrow-association" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <polygon points="0 0, 10 5, 0 10" fill="${color}"/>
      </marker>
      <marker id="arrow-composition" markerWidth="16" markerHeight="12" refX="0" refY="6" orient="auto">
        <polygon points="0 6, 8 0, 16 6, 8 12" fill="${color}"/>
      </marker>
      <marker id="arrow-aggregation" markerWidth="16" markerHeight="12" refX="0" refY="6" orient="auto">
        <polygon points="0 6, 8 0, 16 6, 8 12" fill="none" stroke="${color}" stroke-width="2"/>
      </marker>
    `;
  }

  private generateClass(box: SVGClassBox): string {
    const { x, y, width, height } = box.bounds;
    const boxClass = box.isInterface ? 'interface-box' : 'class-box';

    let svg = `<g class="class-group" data-name="${box.name}">`;

    // Box
    svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="${boxClass}" rx="5"/>`;

    // Interface label
    if (box.isInterface) {
      svg += `<text x="${x + width/2}" y="${y + 15}" text-anchor="middle" class="interface-label">&lt;&lt;interface&gt;&gt;</text>`;
    }

    // Class name
    const nameY = box.isInterface ? y + 30 : y + 22;
    svg += `<text x="${x + width/2}" y="${nameY}" text-anchor="middle" class="class-name">${box.name}</text>`;

    // Separator after name
    let currentY = nameY + 8;
    svg += `<line x1="${x + 5}" y1="${currentY}" x2="${x + width - 5}" y2="${currentY}" class="separator"/>`;

    // Attributes
    if (box.attributes.length > 0) {
      currentY += this.CLASS_PADDING;
      for (const attr of box.attributes) {
        currentY += this.LINE_HEIGHT;
        svg += `<text x="${x + 10}" y="${currentY}" class="member-text">${attr}</text>`;
      }
      currentY += 5;
      svg += `<line x1="${x + 5}" y1="${currentY}" x2="${x + width - 5}" y2="${currentY}" class="separator"/>`;
    }

    // Methods
    if (box.methods.length > 0) {
      currentY += this.CLASS_PADDING;
      for (const method of box.methods) {
        currentY += this.LINE_HEIGHT;
        svg += `<text x="${x + 10}" y="${currentY}" class="member-text">${method}</text>`;
      }
    }

    svg += '</g>';

    return svg;
  }

  private generateEdge(edge: SVGEdge): string {
    if (edge.points.length < 2) return '';

    const [from, to] = edge.points;
    const marker = this.getMarkerForType(edge.type);

    let svg = `<g class="edge-group" data-from="${edge.from}" data-to="${edge.to}">`;

    // Edge line
    const style = edge.type === 'implementation' ? 'stroke-dasharray="5,5"' : '';
    svg += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" class="edge" ${style} marker-end="url(#${marker})"/>`;

    // Label
    if (edge.label) {
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      svg += `<text x="${midX}" y="${midY - 5}" text-anchor="middle" class="edge-label">${edge.label}</text>`;
    }

    svg += '</g>';

    return svg;
  }

  private getMarkerForType(type: SVGEdge['type']): string {
    const markers = {
      'inheritance': 'arrow-inheritance',
      'implementation': 'arrow-implementation',
      'association': 'arrow-association',
      'composition': 'arrow-composition',
      'aggregation': 'arrow-aggregation'
    };

    return markers[type];
  }

  private calculateCanvasSize(): Size {
    let maxX = 0;
    let maxY = 0;

    for (const box of this.classes.values()) {
      maxX = Math.max(maxX, box.bounds.x + box.bounds.width);
      maxY = Math.max(maxY, box.bounds.y + box.bounds.height);
    }

    return {
      width: maxX + 50,
      height: maxY + 50
    };
  }
}

// Usage Example
const generator = new CompleteSVGGenerator('light');

const classes = [
  {
    name: 'User',
    attributes: ['- id: number', '- name: string', '- email: string'],
    methods: ['+ getName(): string', '+ setName(name: string): void']
  },
  {
    name: 'Admin',
    attributes: ['- permissions: string[]'],
    methods: ['+ hasPermission(perm: string): boolean'],
    isInterface: false
  }
];

const relationships = [
  { from: 'Admin', to: 'User', type: 'inheritance' }
];

const svg = generator.generateFromData(classes, relationships);
console.log(svg);
```

## Example 3: Export to Multiple Formats

```typescript
// export-service.ts
export class DiagramExportService {
  async exportSVG(svgString: string): Promise<Blob> {
    return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  }

  async exportPNG(svgString: string, scale: number = 2): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load SVG'));

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.src = url;
    });
  }

  async exportPDF(svgString: string): Promise<Blob> {
    // Using jsPDF + svg2pdf
    const { jsPDF } = await import('jspdf');
    const svg2pdf = await import('svg2pdf.js');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const svgElement = new DOMParser()
      .parseFromString(svgString, 'image/svg+xml')
      .documentElement as any;

    await pdf.svg(svgElement, {
      x: 10,
      y: 10,
      width: 277, // A4 landscape width - margins
      height: 190  // A4 landscape height - margins
    });

    return pdf.output('blob');
  }

  async downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

These examples provide production-ready code for generating UML diagrams!
