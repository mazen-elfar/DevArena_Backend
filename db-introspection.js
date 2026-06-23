import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function deepAudit() {
    console.log('Starting Deep Introspection...');
    
    // 1. Get all tables in public schema
    const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
    
    // 2. Get all columns for all tables
    const columns = await prisma.$queryRaw`
        SELECT table_name, column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public';
    `;
    
    // 3. Get all enums (PostgreSQL custom types)
    const enums = await prisma.$queryRaw`
        SELECT t.typname as enum_name, e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public';
    `;

    // 4. Get all Foreign Keys
    const fks = await prisma.$queryRaw`
        SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY';
    `;

    const dbAudit = {
        tables: tables.map(t => t.table_name),
        columns,
        enums,
        fks
    };

    fs.writeFileSync('db-introspection.json', JSON.stringify(dbAudit, null, 2));
    console.log('Deep Introspection complete. Results saved to db-introspection.json');
    await prisma.$disconnect();
}

deepAudit();
