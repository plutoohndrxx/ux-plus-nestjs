const fs = require('node:fs');
const path = require('node:path');

// 解析類屬性
function parseClassProperties(fileContent) {
  const properties = [];
  
  // 匹配屬性聲明，包括裝飾器
  const propertyRegex = /@[^@\n]*\n\s*declare\s+(\w+):\s+(\w+);/g;
  let match;
  
  while ((match = propertyRegex.exec(fileContent)) !== null) {
    const fullMatch = match[0];
    const propertyName = match[1];
    const propertyType = match[2];
    
    // 檢查是否有關聯裝飾器
    const hasAssociationDecorator = ['HasOne', 'HasMany', 'BelongsTo'].some(decorator => 
      fullMatch.includes(`@${decorator}`)
    );
    
    if (!hasAssociationDecorator) {
      properties.push({ name: propertyName, type: propertyType });
    }
  }
  
  return properties;
}

function capitalizeFirstLetter(str) {
   return str.split('-').filter(Boolean).map(str=>str.charAt(0).toUpperCase() + str.slice(1)).join('')
}

// 生成 interface
function generateInterface(className, properties) {
  let interfaceString = `export interface ${capitalizeFirstLetter(className)}Inter {\n`;
  
  properties.forEach(prop => {
    interfaceString += `  ${prop.name}: ${prop.type};\n`;
  });
  
  interfaceString += '}\n';
  return interfaceString;
}

function generateInterfaceFromModel(modelFilePath) {
  try {
    // 讀取文件內容
    const fileContent = fs.readFileSync(modelFilePath, 'utf8');
    
    // 獲取類名
    const className = path.basename(modelFilePath, '.ts').replace('.model', '');
    
    // 解析屬性
    const properties = parseClassProperties(fileContent);
    
    // 生成 interface
    const interfaceString = generateInterface(className, properties);
    
    // 創建輸出目錄
    const outputDir = path.join(path.dirname(modelFilePath), '../interfaces');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 寫入文件
    const outputPath = path.join(outputDir, `${className}.interface.ts`);
    fs.writeFileSync(outputPath, interfaceString);
  } catch (error) {
    console.error('生成接口時發生錯誤：', error);
  }
}

function main(dirPath) {
    const filePath = path.resolve(process.cwd(),dirPath);
    const files = fs.readdirSync(filePath);
    files.forEach((fileName)=>{
        if(!fileName.includes('.model.ts')) return void 0;
        const fullPath = path.resolve(filePath,fileName);
        generateInterfaceFromModel(fullPath);
    })
}

main('./src/databases/mysql-database/model');