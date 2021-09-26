

const socket  = io()

const sbtbtn = document.querySelector('#submitbtn');
const ipttxt = document.querySelector('.message');
const shrloc = document.querySelector('#send-location');
const msgtem = document.querySelector('#message-template').innerHTML;
const locmsgtem = document.querySelector('#location-message-template').innerHTML;
const messages = document.querySelector('#messages');
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML;


const qs = window.location.search
const urlParams = new URLSearchParams(qs);

const username = urlParams.get('username')
const room = urlParams.get('room')

const autoscroll = () =>{
    const newmessage = messages.lastElementChild;
    const newmessagesstyle = getComputedStyle(newmessage)
    const newMargin = parseInt(newmessagesstyle.marginBottom)
    const newmessagesheight = newMargin + newmessage.offsetHeight
    const visibleheight = messages.offsetHeight
    const containerheight = messages.scrollHeight
    const scrolloffset = visibleheight + messages.scrollTop

    if((containerheight - newmessagesheight)<= scrolloffset){
        messages.scrollTop = messages.scrollHeight
    }
}


socket.on('roomdata' , ({room , users}) =>{
    const html = Mustache.render(sidebartemplate , {room , users})
    document.querySelector('#chat-sidebar').innerHTML = html
})


socket.on('sent',( message)=>{
    const view = { username : message.username , message : message.text , createdAt : moment( message.createdAt).format('h:mm a')}
    //console.log(username +' ' + message)
    const html = Mustache.render(msgtem , view)
    messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})
socket.on('sendloc',(loc)=>{
    const view =  {username : loc.username ,  loc : loc.text , createdAt :  moment( loc.createdAt).format('h:mm a')}
    console.log(loc.text)
    const html = Mustache.render(locmsgtem , view)
    messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

sbtbtn.addEventListener('click',(e)=>{
   e.preventDefault()
    const ipt = ipttxt.value
    if(ipt.length == 0){
        return
    }
    sbtbtn.setAttribute('Disabled' , 'Disabled')
    socket.emit('message' , ipttxt.value , (error)=>{
        sbtbtn.removeAttribute('Disabled')
        if(error){
            console.log(error)
            return alert(error)
        }
        console.log('Message Delivered')
    })
    ipttxt.value = '';
})
shrloc.addEventListener('click',(e) =>{
    e.preventDefault()
    shrloc.setAttribute('Disabled' , 'Disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('locshare' ,{ latitude : position.coords.latitude , longitude : position.coords.longitude }  , ()=>{
            shrloc.removeAttribute('Disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join',{username , room}, (error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})