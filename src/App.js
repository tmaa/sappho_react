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
  const [filterSuccess, setFilterSuccess] = useState(false)
  const [id, setId] = useState()
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [email, setEmail] = useState("")
  const [potentialMatches, setPotentialMatches] = useState([])
  const [currentUserName, setCurrentUserName] = useState("a")
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(99)
  const [maxDistance, setMaxDistance] = useState(25)
  const [gender, setGender] = useState('w')
  const [showMe, setShowMe] = useState('w')

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
          console.log("user deleted from db")
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
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position) => {
        var data = {
          "id": id, 
          "name": name, 
          "dob": dob, 
          "email": email, 
          "phone": phone, 
          "coordinates": {longitude: position.coords.longitude, latitude: position.coords.latitude},
          "gender": gender,
          "interested_in": showMe
        }
        
        console.log(data)
        
        axios.post(`http://localhost:3001/api/users/register`, data)
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log(err)
          })
      })
    }else{
      console.log("location not available")
    }

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

    currentUser.getIdToken(true).then(token => {
      axios.get(`http://localhost:3001/api/users/me`, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      }).then((res) => {
        setCurrentUserName(res.data.user.name)
        console.log(res.data)
      }).catch((err) => {
        console.log(err)
      })
    })
  }



  function filterPotentialMatches(){
    const currentUser = auth.currentUser;

    currentUser.getIdToken(true).then(token => {
      axios.get(`http://localhost:3001/api/search/filter`, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      }).then((res) => {
        console.log(res.data.users)
        setPotentialMatches(res.data.users)
        setFilterSuccess(true)
      }).catch((err) => {
        console.log(err)
      })
    })
  }

  function getAge(dob){
    const today = new Date();
    var diff = today.getTime() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  function updatePreferences(){
    const prefPayload = {
      minimum_age: minAge,
      maximum_age: maxAge,
      maximum_distance: maxDistance,
      interested_in: showMe
    }
    const currentUser = auth.currentUser;
    console.log(prefPayload)
    currentUser.getIdToken(true).then(token => {
      axios.put(`http://localhost:3001/api/users/me/preferences`, prefPayload, {
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

  const likeClicked = (e) => {
    const currentUser = auth.currentUser;
    const likePayload = {
      user_id: currentUser.uid,
      target_user_id: e.target.getAttribute("id"),
      liked: true
    }
    currentUser.getIdToken(true).then(token => {
      axios.post(`http://localhost:3001/api/actions/like`, likePayload, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      }).then((res) => {
        console.log(res)
      }).catch((err) => {
        console.log(err)
      })
    })

    console.log(`my id: ${currentUser.uid} other user id: ${e.target.getAttribute("id")}`)
    const id = e.target.getAttribute("id")
    setPotentialMatches(potentialMatches.filter(item => item.id !== id))
  }

  const dislikeClicked = (e) => {
    const currentUser = auth.currentUser;

    console.log(`my id: ${currentUser.uid} other user id: ${e.target.getAttribute("id")}`)
    const id = e.target.getAttribute("id")
    setPotentialMatches(potentialMatches.filter(item => item.id !== id))
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
              <h2>{currentUserName}</h2>
              <h2>{id}</h2>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder='name'></input>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} placeholder='age'></input>
              <div>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder='email'></input>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder='phone'></input>
                <div>
                  <label>i am a</label>
                  <select onChange={e => setGender(e.target.value)} value={gender}>
                    <option value={'m'}>Man</option>
                    <option value={'w'}>Woman</option>
                    <option value={'tm'}>Trans Man</option>
                    <option value={'tw'}>Trans Woman</option>
                  </select>
                  <label>show me</label>
                  <select value={showMe} onChange={e => setShowMe(e.target.value)}>
                    <option value={'m'}>Men</option>
                    <option value={'w'}>Women</option>
                    <option value={'e'}>Everyone</option>
                  </select>
                </div>
              </div>
              <div><button type="submit">complete registration</button></div>
            </form>
            <div><button onClick={() => getCurrentUserInfo()}>get current user info</button></div>
            <div>
              <input value={minAge} placeholder='min age' onChange={e => setMinAge(e.target.value)}></input>
              <input value={maxAge} placeholder='max age' onChange={e => setMaxAge(e.target.value)}></input>
              <input value={maxDistance} placeholder='max distance' onChange={e => setMaxDistance(e.target.value)}></input>
              <label>show me</label>
              <select value={showMe} onChange={e => setShowMe(e.target.value)}>
                <option value={'m'}>Men</option>
                <option value={'w'}>Women</option>
                <option value={'e'}>Everyone</option>
              </select>
              <button onClick={(() => updatePreferences())}>update preferences</button>
            </div>
            <div style={{paddingBottom: "30px"}}><button onClick={() => filterPotentialMatches()}>filter potential matches</button></div>
            {(filterSuccess && potentialMatches) ? (
              potentialMatches.map((potentialMatch, index) => {
                return(
                  <div key={index}>
                    <label>{potentialMatch.name} {potentialMatch.age} </label>
                    <button id={potentialMatch.id} onClick={likeClicked}>like</button>
                    <button id={potentialMatch.id} onClick={dislikeClicked}>dislike</button>
                  </div>
                )
              })
            ) : (null)}
          </div>
          ) : (null)
        }
      </header>
    </div>
  );
}

export default App;
