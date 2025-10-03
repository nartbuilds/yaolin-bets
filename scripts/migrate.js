import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrate() {
  try {
    console.log('Adding paid_entry column to users table...')

    const { error } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS paid_entry BOOLEAN DEFAULT FALSE;'
      })

    if (error) {
      // Try direct SQL execution
      const { data, error: sqlError } = await supabase
        .from('users')
        .select('paid_entry')
        .limit(1)

      if (sqlError && sqlError.code === '42703') {
        console.log('Column does not exist, need to run migration manually')
        console.log('Please run this SQL in your Supabase SQL editor:')
        console.log('ALTER TABLE users ADD COLUMN paid_entry BOOLEAN DEFAULT FALSE;')
        return
      }
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate()