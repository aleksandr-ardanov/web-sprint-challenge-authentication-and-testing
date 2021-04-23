const db = require('../../data/dbConfig')

const getAll = () => {
    return db('users')
}

const findById = (id) => {
    return db('users').where({id}).first()
}

const findBy = (filter) => {
    return db('users').where(filter)
}

const add = async (user) => {
    const [id] = await db('users').insert(user)
    return findById(id)
}

const update = async (id, newData) => {
    await db('users').where({id}).update(newData)
    return findById(id)
}

const remove = async (id) => {
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