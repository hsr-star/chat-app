const Users = []

const addUser = ({id, username , room}) =>{
    if(username!= null){
        username = username.trim()
    }
    if(room != null)
        room = room.trim().toLowerCase()
    
    if(!username || !room){
        return {
            error:"UserName and room are Required"
        }
    }
    const existinguser = Users.find((user) =>{
        return user.room === room && user.username === username
    })
    if(existinguser){
        return { error : "UserName taken"}
    }
    const user = {id , username , room }
    Users.push(user)

    return {user}
}

const removeUser = (id) =>{
    const index = Users.findIndex((user) =>{
        return user.id === id
    })
    if(index !== -1){
        return Users.splice(index , 1)[0]
    }
}
const getUser = (id) =>{
    return Users.find((user)=> user.id === id)
}
const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return Users.filter((user)=> user.room === room)
}

module.exports = { addUser , removeUser , getUser , getUserInRoom }

