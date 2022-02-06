import './App.css';
import { useEffect, useState } from 'react';
import {getAuth, signInAnonymously, signOut, deleteUser} from 'firebase/auth'
import axios from 'axios';

function App() {
  const [phoneNumber, setPhoneNumber] = useState()
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [id, setId] = useState()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [height, setHeight] = useState("")
  const [email, setEmail] = useState("")

  function onAnonClick(){
    const auth = getAuth();
    signInAnonymously(auth)
      .then((res) => {
        setId(res.user.uid)
        setRegisterSuccess(true)
        console.log(res)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode + ": " + errorMessage)
      });  }

  function onPhoneClick(number){
    console.log(number)
  }

  function logoutClick(){
    const auth = getAuth();
    const user = auth.currentUser;

    if(user.isAnonymous){
      deleteUser(user).then(() => {
        axios.delete(`http://localhost:3001/api/users/delete/${id}`)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
        setRegisterSuccess(false)
        console.log("anon user deleted")
      }).catch((err) => {
        console.log(err)
      })
    }else{
      signOut(auth).then(() => {
        setRegisterSuccess(false)
        console.log("logged out: ", user)
      }).catch((error) => {
        console.log("err: ", error)
      });
    }
  }

  function handleSubmit(e){
    var data = {"id": id, "name": name, "age": age, "height": height, "email": email}
    
    axios.post(`http://localhost:3001/api/users/register`, data)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })

    // setName("")
    // setAge("")
    // setHeight("")
    // setEmail("")
    //logoutClick()
    //setRegisterSuccess(false)
    e.preventDefault()
  }

  function getCurrentUserInfo(){
    //use to test token/auth protected api
  }

  return (
    <div className="App">
      <header className="App-header">
        <button>log in with Google</button>
        <div>
          <button onClick={() => onPhoneClick(phoneNumber)}>log in with phone number</button>
          <input onChange={e => setPhoneNumber(e.target.value)}></input>
        </div>
        <button onClick={() => onAnonClick()}>anonymous sign in</button>
        <button onClick={() => logoutClick()}>delete/log out</button>
        <h1>{phoneNumber}</h1>
        {registerSuccess ? (
          <div>
            <form onSubmit={handleSubmit}>
              <h1>success {id}</h1>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder='name'></input>
              <input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder='age'></input>
              <input type="text" value={height} onChange={e => setHeight(e.target.value)} placeholder='height'></input>
              <div>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder='email'></input>
              </div>
              <div><button type="submit">complete registration</button></div>
            </form>
          </div>
          ) : (null)
        }
      </header>
    </div>
  );
}

export default App;
