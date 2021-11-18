import { useEffect, useState } from 'react'
import Amplify, { API } from 'aws-amplify'
import awsExports from "./aws-exports";
import { ListTodosQuery, Todo } from './API';
import { mapListTodos } from './models/todo';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { withAuthenticator } from '@aws-amplify/ui-react'
import axios from 'axios';
Amplify.configure(awsExports);

const initialState = {name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchTodos()
  }, [])

  const setInput = (key:string, value:string) => {
    setFormState({ ...formState, [key]: value })
  }

  const fetchTodos = async () => {
    try {
      const todoData = await API.graphql({ query: queries.listTodos }) as GraphQLResult<ListTodosQuery>
      const todos = mapListTodos(todoData);
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  const addTodo = async () => {
    try {
      if (!formState.name || !formState.description) return    
      const todo = {...formState} as Todo
      setTodos([...todos, todo])
      setFormState(initialState);
      await API.graphql({ query: mutations.createTodo, variables: {input: todo}});
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  const callFireFly = () => {
    const msgData = {
      data: [
        {
          value: "2nd Message"
        }
      ]
    }
    
    axios.post('http://127.0.0.1:5000/api/v1/namespaces/default/messages/broadcast', msgData)
     .then(res => {
        console.log(res);
        const responseData = res.data

        // if (responseData.status === 'success') {
        //   console.log("IT WORKED")
        //   console.log(responseData);
        // } else {
        //   console.log("this did not work");
        //   console.log(responseData);
        // }
     })
  }




  return (
    <div >
      <h2>Amplify Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        value={formState.name ? formState.name : ""}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        // style={styles.input}
        value={formState.description ? formState.description : ""}
        placeholder="Description"
      />
      <button onClick={() => {
        addTodo()
        callFireFly()
      }}>
      Create Todo
      </button>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index}>
            <p>{todo.name}</p>
            <p>{todo.description}</p>
          </div>
        ))
      }
    </div>
  )
}

export default withAuthenticator(App)
