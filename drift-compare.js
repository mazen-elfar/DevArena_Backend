import fs from 'fs';

function parseSchema(content) {
    const models = {};
    let currentModel = null;
    
    content.split('\n').forEach(line => {
        line = line.trim();
        if (line.startsWith('model ')) {
            currentModel = line.split(' ')[1];
            models[currentModel] = { fields: {}, map: null };
        } else if (line.startsWith('@@map("')) {
            const mapMatch = line.match(/@@map\("([^"]+)"\)/);
            if (mapMatch) models[currentModel].map = mapMatch[1];
        } else if (currentModel && (line.includes('@relation') || (!line.startsWith('//') && !line.startsWith('@@') && !line.startsWith('}') && line.length > 0))) {
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
                const fieldName = parts[0];
                const fieldType = parts[1];
                let dbName = fieldName;
                const mapMatch = line.match(/@map\("([^"]+)"\)/);
                if (mapMatch) dbName = mapMatch[1];
                
                if (!line.includes('@relation') && !['}', '@@'].some(s => line.startsWith(s))) {
                    models[currentModel].fields[dbName] = { type: fieldType, original: fieldName };
                }
            }
        } else if (line === '}') {
            currentModel = null;
        }
    });
    return models;
}

try {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    const dbData = JSON.parse(fs.readFileSync('db-introspection.json', 'utf8'));
    const prismaModels = parseSchema(schemaContent);

    const report = {
        missingTables: [],
        missingColumns: [],
        extraColumns: [],
        typeMismatches: []
    };

    for (const [model, data] of Object.entries(prismaModels)) {
        const tableName = data.map || model.toLowerCase();
        const physicalTable = dbData.tables.find(t => t.toLowerCase() === tableName.toLowerCase());
        
        if (!physicalTable) {
            report.missingTables.push({ model, tableName });
            continue;
        }

        const dbColumns = dbData.columns.filter(c => c.table_name === physicalTable);
        for (const [dbField, schemaField] of Object.entries(data.fields)) {
            const physicalColumn = dbColumns.find(c => c.column_name === dbField);
            if (!physicalColumn) {
                report.missingColumns.push({ model, tableName: physicalTable, column: dbField });
            }
        }
    }

    fs.writeFileSync('drift-comparison.json', JSON.stringify(report, null, 2));
    console.log('Drift comparison complete.');
} catch (err) {
    console.error('Comparison FAILED:', err.message);
    process.exit(1);
}
