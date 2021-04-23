const db = require('../../data/dbConfig')

const getAll = () => {          //returns list of all users in db
    return db('users')
}

const findById = (id) => {
    return db('users').where({id}).first() //returns specific user by id
}

const findBy = (filter) => {            //returns specific user or users by attribute
    return db('users').where(filter)
}

const add = async (user) => {       //adds a new user to db
    const [id] = await db('users').insert(user)
    return findById(id)
}

const update = async (id, newData) => {     //updates current user, added as stretch
    await db('users').where({id}).update(newData)
    return findById(id)
}

const remove = async (id) => {      //removes current user, added as stretch
    const oldUser = await findById(id)
    await db('users').where({id}).del()
    return {message:`user with id: ${id} deleted`,...oldUser}
}

module.exports = {
    getAll,
    findById,
    findBy,
    add,
    update,
    remove
}