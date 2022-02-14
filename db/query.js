const { Pool,Client } = require('pg')

let query = {}

function get_pool(){
    const _pool = new Pool({
        user: "postgres",
        host: "postgres",
        database: "ed_connect",
        password: "postgres",
        port: 5432
    })
    return _pool
}

query.get_dog_by_url = async function (breed,dog){
    const pool = get_pool()
    let result = {
        status:null,
        content:null
    }
    let _dog = String(dog)
    let _breed = String(breed)
    const query_dog = [
        `
        SELECT dogs.picture, breeds.name
        FROM breeds
        INNER JOIN dogs
        ON dogs.breed_id = breeds.id
        WHERE dogs.picture = $1 AND breeds.name = $2
        `, 
        [_dog,_breed]
    ]
    try{
        const dog_pic_res = await pool.query(...query_dog)
        result.status = "OK"
        result.content = dog_pic_res

    } catch(e){
        result.status = "KO"
        result.content = e
    }
    console.log(result)
    return result 
}


query.insert_picture = async function (picture,breed) {
    const pool = get_pool()

    let result ={
        status: null,
        content: null
    }
    
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
    try{
        //better to use a transaction
        const rs_1 = await pool.query(postgres_query1);
        const rs_2 = await pool.query(postgres_query2);
        result.status = "OK"
        result.content = {rs_1,rs_2}

    } catch(e){
        result.status = "KO"
        result.content = e
    }
    console.log(result)
    return result 
}

query.get_all_breeds = async function() {
    const pool = get_pool()
    let result ={
        status: null,
        content: null
    }
    try{
        const query_breeds = 'SELECT * FROM breeds'
        const breeds_res = await pool.query(query_breeds)
        result.status = "OK"
        result.content = breeds_res
    } catch(e){
        result.status = "KO"
        result.content = e
    }
    console.log(result)
    return result 
}

query.get_random_by_breed = async function(breed){
    const pool = get_pool()
    let result ={
        "status": null,
        "content": null
    }
    const query_random = `
    SELECT dogs.picture, breeds.name
    FROM breeds
    INNER JOIN dogs
    ON dogs.breed_id = breeds.id
    WHERE breeds.name = '${breed}'
    `
    try{
        const breeds_res = await pool.query(query_random)
        result.status = "OK"
        const randomDog = breeds_res.rows[Math.floor(Math.random() * breeds_res.rows.length)];     
        breeds_res.rows = [randomDog] 
        result.content = breeds_res
    }catch(e){
        result.status = "KO"
        result.content = e
    }
    console.log(result)
    return result
}

module.exports.query = query