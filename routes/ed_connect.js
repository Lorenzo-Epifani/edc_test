const { response } = require('express');
var express = require('express');
var database = require('../db/query');

var router = express.Router();

router.get('/show/:breed/:picture', async function(req, res) {
    let response = {
        status_code:0,
        content:null
    }

    const db_res = await database.query.get_dog_by_url(req.params.breed,req.params.picture)
    if (db_res.status==="OK"){
        response.status_code = 200
        response.content = [...db_res.content.rows]
    }
    else{
        response.status_code = 500
    }
    res.send(response);
});

router.post('/create', async (req, res) => {
    let response = {
        status_code:0,
        content:[]
    }
    
    const breed = req.body.breed
    const picture = req.body.picture
    const db_res = await database.query.insert_picture(picture,breed)

    if (db_res.status==="OK"){
        response.status_code = 200
        response.content = [...db_res.content.rows]
    }
    else{
        response.status_code = 500
    }
    res.send(response);
})

router.get('/listBreeds', async function(req, res) {

    let response = {
        status_code:0,
        content:[]
    }

    const db_res = await database.query.get_all_breeds()

    if (db_res.status==="OK"){
        response.status_code = 200
        response.content = [...db_res.content.rows]
    }
    else{
        response.status_code = 500
    }
    res.send(response);
});

router.get('/random/:breed', async function(req, res) {
    let response = {
        status_code:0,
        content:[]
    }
    const breed = req.params.breed
    const db_res = await database.query.get_random_by_breed(breed)

    if (db_res.status==="OK"){
        response.status_code = 200
        response.content = [...db_res.content.rows]
    }
    else{
        response.status_code = 500
    }
    res.send(response);
});

module.exports = router;
