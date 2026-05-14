// XML解析工具
export class XMLParser {
  static parse(xmlString: string): any {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const records = doc.querySelectorAll('RECORD');
    const results: any[] = [];
    
    records.forEach(record => {
      const obj: any = {};
      for (let i = 0; i < record.attributes.length; i++) {
        const attr = record.attributes[i];
        const value = attr.value;
        
        // 尝试转换为数字
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          obj[attr.name] = parseFloat(value);
        } else {
          obj[attr.name] = value;
        }
      }
      results.push(obj);
    });
    
    return results;
  }
  
  static parseFromString(content: string): any[] {
    // 移除XML声明和根标签
    const cleaned = content
      .replace(/<\?xml[^>]*\?>/g, '')
      .replace(/<\/?RECORDS>/g, '');
    
    return this.parse(`<RECORDS>${cleaned}</RECORDS>`);
  }
}
