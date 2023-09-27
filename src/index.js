import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState,useEffect } from 'react';
import axios from 'axios';


const VacationForm = ({ places, users, bookVacation })=> {
  const [placeId, setPlaceId] = useState('');
  const [userId, setUserId] = useState('');
  const [note, setNote] = useState('');

  const save = (ev)=> {
    ev.preventDefault();
    const vacation = {
      user_id: userId,
      place_id: placeId,
      note:note
    };
    bookVacation(vacation);
    setPlaceId('');
  setUserId('');
  setNote('');
  }
  return (
    <form onSubmit={ save }>
      <select value={ userId } onChange={ ev => setUserId(ev.target.value)}>
        <option value=''>-- choose a user --</option>
        {
          users.map( user => {
            return (
              <option key={ user.id } value={ user.id }>{ user.name }</option>
            );
          })
        }
      </select>
      <select value={ placeId } onChange={ ev => setPlaceId(ev.target.value)}>
        <option value=''>-- choose a place --</option>
        {
          places.map( place => {
            return (
              <option key={ place.id } value={ place.id }>{ place.name }</option>
            );
          })
        }
      </select>
      <input
        type="text"
        placeholder="Enter a note (optional)"
        value={note}
        onChange={(ev) => setNote(ev.target.value)}
      />

      <button disabled={ !placeId || !userId }>Book Vacation</button>
    </form>
  );
}

const Users = ({ users, vacations })=> {
  return (
    <div>
      <h2>Users ({ users.length })</h2>
      <ul>
        {
          users.map( user => {
            return (
              <li key={ user.id }>
                { user.name }
                ({ vacations.filter(vacation => vacation.user_id === user.id).length })
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const Vacations = ({ vacations, places, cancelVacation, users })=> {
  return (
    <div>
      <h2>Vacations ({ vacations.length })</h2>
      <ul>
        {
          vacations.map( vacation => {
            const place = places.find(place => place.id === vacation.place_id);
            const user = users.find(user => user.id === vacation.place_id);
            return (
              <li key={ vacation.id }>
                { new Date(vacation.created_at).toLocaleString() }
                <div> 
                  to { place ? place.name : '' }
                </div>
                <div> 
                  for { user ? user.name : '' }
                </div>
                <div> 
                  note { vacation.note }
                </div>
                <button onClick={()=> cancelVacation(vacation)}>Cancel</button>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const Places = ({ places, vacations }) => {
  const maxVacationsForPlace = Math.max(
    ...places.map(place =>
      vacations.filter(vacation => vacation.place_id === place.id).length
    )
  )
  const highlightedPlaces = places
    .filter(place =>
      vacations.filter(vacation => vacation.place_id === place.id).length === maxVacationsForPlace
    )
    .map(place => place.name)

  return (
    <div>
      <h2>Places ({places.length})</h2>
      <ul>
        {places.map(place => {
          const numVacations = vacations.filter(
            vacation => vacation.place_id === place.id
          ).length

          const isMax = numVacations === maxVacationsForPlace

          return (
            <li
              key={place.id}
              style={{ fontWeight: isMax ? 'bold' : 'normal' }}
            >
              {place.name} ({numVacations})
            </li>
          )
        })}
      </ul>

      <h3>Most Popular Place(s):</h3>
      <ul>
        {highlightedPlaces.map(placeName => (
          <li key={placeName}>{placeName}</li>
        ))}
      </ul>
    </div>
  )
};


const App = ()=> {
  const [users, setUsers] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [places, setPlaces] = useState([]);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/vacations');
      setVacations(response.data);
    }
    fetchData();
  }, []);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/places');
      setPlaces(response.data);
    }
    fetchData();
  }, []);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    }
    fetchData();
  }, []);

  const bookVacation = async(vacation)=> {
    const response = await axios.post('/api/vacations', vacation);
    setVacations([...vacations, response.data]);
  }

  const cancelVacation = async(vacation)=> {
    await axios.delete(`/api/vacations/${vacation.id}`);
    setVacations(vacations.filter(_vacation => _vacation.id !== vacation.id));
  }

  return (
    <div>
      <h1>Vacation Planner</h1>
      <VacationForm places={ places } users={ users } bookVacation={ bookVacation }/>
      <main>
        <Vacations
          vacations={ vacations }
          places={ places }
          cancelVacation={ cancelVacation }
          users={users}
        />
        <Users users={ users } vacations={ vacations }/>
        <Places places={ places } vacations={ vacations }/>
      </main>
    </div>
  );
};


const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(<App />);
