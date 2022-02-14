const { Pool,Client } = require('pg')
const axios = require('axios');
const INIT_DB = process.argv[2]

const _pool = new Pool({
    user: "postgres",
    host: "postgres",
    database: "ed_connect",
    password: "postgres",
    port: 5432
})

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function create_tables(pool){
    let response = {
        status: null,
        message: null
    }
    const query1=`CREATE TABLE breeds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE
        )`

    const query2=`CREATE TABLE dogs (
        id SERIAL PRIMARY KEY,
        breed_id SERIAL NOT NULL,
        picture VARCHAR(100) UNIQUE,
        CONSTRAINT fk_breeds FOREIGN KEY(breed_id) REFERENCES breeds(id)
        )`
    try {
        const q_results = {
            "CREATE_TABLE_breeds" : await pool.query(query1),
            "CREATE_TABLE_dogs": await pool.query(query2)
        }
        response.status="OK";
        response.message=q_results;
    } catch (e) {
        response.status = "KO";
        response.message = e;
    }
    console.log(response)
}

async function drop_tables(pool){
    postgres_query = `
        DROP TABLE breeds, dogs;
    `
    try{
        result = await pool.query(postgres_query)
        console.log(result)}
    catch(e){
        console.log(e)
    }
}

async function scrape_dogs(pool){
    for (let i = 0; i < 50; i++) {
        await sleep(700)
        let result = {
            status: null,
            message: null
        }

        const scrape_url = "https://dog.ceo/api/breeds/image/random"
        const dog_rs = await axios.get(scrape_url);
        const url_data = new URL(dog_rs.data.message)
        const breed = url_data.pathname.split('/')[2]
        const picture = url_data.pathname.split('/')[3]

        //would be better a transaction
        const postgres_query1 =`
        INSERT INTO breeds (name)
        VALUES ('${breed}')
        ON CONFLICT (name)
        DO NOTHING
        `

        const postgres_query2 =`
        INSERT INTO dogs (breed_id,picture)
        VALUES ((SELECT id from breeds WHERE name='${breed}'),'${picture}')
        ON CONFLICT (picture)
        DO NOTHING
        `
        
        try {
            const q_results = {
                "INSERT_BREED" : await pool.query(postgres_query1),
                "INSERT_DOG": await pool.query(postgres_query2)
            }
            result.status="OK";
            result.message=q_results;
        } catch (e) {
            result.status="KO";
            result.message=e;
        }
        console.log(result)
    }
}

async function init_db(pool) {
    console.log("####TRYING TO INIT DATABASE........####")
    await create_tables(pool);
    await scrape_dogs(pool);
   }

if (INIT_DB === "YES"){
    init_db(_pool).then(res => {
        console.log("DONE")
    })
}
/*
const client = new Client()
await client.connect()
const res = await client.query('SELECT $1::text as message', ['Hello world!'])
console.log(res.rows[0].message) // Hello world!
await client.end()
*/