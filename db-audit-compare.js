import fs from 'fs';

function parseSchema(content) {
    const models = {};
    const enums = {};
    let currentModel = null;
    let currentEnum = null;
    
    content.split('\n').forEach(line => {
        line = line.trim();
        if (line.startsWith('model ')) {
            currentModel = line.split(' ')[1];
            models[currentModel] = { fields: {}, map: null, raw: [] };
        } else if (line.startsWith('enum ')) {
            currentEnum = line.split(' ')[1];
            enums[currentEnum] = { values: [] };
        } else if (line.startsWith('@@map("')) {
            const mapMatch = line.match(/@@map\("([^"]+)"\)/);
            if (mapMatch) models[currentModel].map = mapMatch[1];
        } else if (currentModel && line === '}') {
            currentModel = null;
        } else if (currentEnum && line === '}') {
            currentEnum = null;
        } else if (currentModel) {
            const parts = line.split(/\s+/);
            if (parts.length >= 2 && !line.startsWith('@@') && !line.startsWith('//')) {
                const fieldName = parts[0];
                const fieldType = parts[1];
                let dbName = fieldName;
                const mapMatch = line.match(/@map\("([^"]+)"\)/);
                if (mapMatch) dbName = mapMatch[1];
                
                if (!line.includes('@relation')) {
                    models[currentModel].fields[dbName] = { type: fieldType, original: fieldName, line };
                }
            }
        } else if (currentEnum && line.length > 0 && !line.startsWith('//') && !line.startsWith('@@')) {
            const value = line.split(/\s+/)[0];
            if (value) enums[currentEnum].values.push(value);
        }
    });
    return { models, enums };
}

try {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    const snapshot = JSON.parse(fs.readFileSync('db-evidence-snapshot.json', 'utf8'));
    const prisma = parseSchema(schemaContent);

    const audit = {
        missingTables: [],
        missingColumns: [],
        extraColumns: [],
        enumMismatches: [],
        fkMismatches: []
    };

    // Audit Tables & Columns
    for (const [model, data] of Object.entries(prisma.models)) {
        const tableName = data.map || model.toLowerCase();
        const physicalTable = snapshot.tables.find(t => t.toLowerCase() === tableName.toLowerCase());
        
        if (!physicalTable) {
            audit.missingTables.push({
                model,
                table: tableName,
                proof: `SELECT table_name FROM information_schema.tables WHERE table_name = '${tableName}';`
            });
            continue;
        }

        const dbColumns = snapshot.columns.filter(c => c.table_name === physicalTable);
        for (const [dbField, fieldInfo] of Object.entries(data.fields)) {
            const physicalColumn = dbColumns.find(c => c.column_name === dbField);
            if (!physicalColumn) {
                audit.missingColumns.push({
                    model,
                    table: physicalTable,
                    field: dbField,
                    schemaState: fieldInfo.type,
                    proof: `SELECT column_name FROM information_schema.columns WHERE table_name = '${physicalTable}' AND column_name = '${dbField}';`
                });
            }
        }
        
        // Extra Columns
        for (const col of dbColumns) {
            if (!data.fields[col.column_name]) {
                audit.extraColumns.push({
                    table: physicalTable,
                    column: col.column_name,
                    dbType: col.data_type
                });
            }
        }
    }

    // Audit Enums
    for (const [enumName, data] of Object.entries(prisma.enums)) {
        const dbEnumValues = snapshot.enums
            .filter(e => e.enum_name.toLowerCase() === enumName.toLowerCase())
            .map(e => e.enum_value);
        
        if (dbEnumValues.length === 0) {
            audit.enumMismatches.push({
                enum: enumName,
                problem: 'Missing in DB',
                proof: `SELECT typname FROM pg_type WHERE typname = '${enumName.toLowerCase()}';`
            });
            continue;
        }

        const missingInDb = data.values.filter(v => !dbEnumValues.includes(v));
        if (missingInDb.length > 0) {
            audit.enumMismatches.push({
                enum: enumName,
                problem: 'Values missing in DB',
                missing: missingInDb,
                dbValues: dbEnumValues
            });
        }
    }

    fs.writeFileSync('db-audit-results.json', JSON.stringify(audit, null, 2));
    console.log('Phase 2 Comparison complete.');
} catch (err) {
    console.error('Audit comparison FAILED:', err);
    process.exit(1);
}
