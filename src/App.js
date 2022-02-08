import './App.css';
import { useEffect, useState } from 'react';
import { signInAnonymously, 
  signOut, 
  deleteUser, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  setPersistence} from 'firebase/auth'
import {auth} from "./firebase"
import axios from 'axios';


function App() {
  const [phone, setPhone] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [id, setId] = useState()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [height, setHeight] = useState("")
  const [email, setEmail] = useState("")

  const [expand, setExpand] = useState(false)

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        
      }
    }, auth);
  }

  const requestOTP = (e) => {
    console.log("submit clicked")
    e.preventDefault();
    if(phone.length >= 2){
      let phoneNumber = "+1" + phone
      console.log(phoneNumber)
      generateRecaptcha();
      let appVerifier = window.recaptchaVerifier;
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then(res => {
          console.log(res)
          window.confirmationResult = res
        }).catch((err) => {
          console.log(err)
        })
    }
  }

  function onAnonClick(){
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
      });  
    }


  function logoutAndDelete(){
    const user = auth.currentUser;

    if(id){
      //delete from mongodb
      user.getIdToken(true).then(token => {
        axios.delete(`http://localhost:3001/api/users/me/delete`, {
          headers: {
            'authorization': `Bearer ${token}`
          }
        }).then((res) => {
          setRegisterSuccess(false)
          console.log("user deleted from mongodb")
        }).catch((err) => {
          console.log(err)
        })
      })
      //delete from firebase
      deleteUser(user).then(() => {
        setRegisterSuccess(false)
        console.log("user deleted from firebase")
      }).catch((err) => {
        console.log(err)
      })
    }else{
      console.log("no one signed in")
    }

  }

  function logoutWithoutDelete(){
    const user = auth.currentUser;
    signOut(auth).then(() => {
      setRegisterSuccess(false)
      console.log("logged out: ", user)
    }).catch((error) => {
      console.log("err: ", error)
    });
  }

  function handleSubmit(e){
    var data = {"id": id, "name": name, "age": age, "height": height, "email": email, "phone": phone}
    
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
    const currentUser = auth.currentUser;
    console.log(currentUser)

    currentUser.getIdToken(true).then(token => {
      axios.get(`http://localhost:3001/api/users/me`, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      }).then((res) => {
        console.log(res.data)
      }).catch((err) => {
        console.log(err)
      })
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => onAnonClick()}>anonymous sign in</button>
        <button onClick={() => logoutAndDelete()}>log out & delete</button>
        <button onClick={() => logoutWithoutDelete()}>log out</button>
        {registerSuccess ? (
          <div>
            <form onSubmit={handleSubmit}>
              <h1>success {id}</h1>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder='name'></input>
              <input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder='age'></input>
              <input type="text" value={height} onChange={e => setHeight(e.target.value)} placeholder='height'></input>
              <div>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder='email'></input>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder='phone'></input>
              </div>
              <div><button type="submit">complete registration</button></div>
            </form>
            <div><button onClick={() => getCurrentUserInfo()}>get current user info</button></div>
          </div>
          ) : (null)
        }
      </header>
    </div>
  );
}

export default App;
