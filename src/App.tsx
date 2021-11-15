import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import awsExports from "./aws-exports";
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { ListTodosQuery, Todo, UpdateTodoInput } from './API';
import { mapListTodos } from './models/todo';
Amplify.configure(awsExports);

const initialState: UpdateTodoInput = {id: '', name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState<UpdateTodoInput>(initialState)

  const [todos, setTodos] = useState<Todo[]>([]);
  useEffect(() => {
    fetchTodos()
  }, [])

  const setInput = (key:string, value:string) => {
    setFormState({ ...formState, [key]: value })
  }

  const fetchTodos = async () => {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos)) as GraphQLResult<ListTodosQuery>
      const todos = mapListTodos(todoData);
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  const addTodo = async () => {
    try {
      if (!formState.name || !formState.description) return    
      
      const todo: Todo = {
        __typename: 'Todo',
        id: Math.random().toString(),
        name: formState.name,
        description: formState.description,
        createdAt: "",
        updatedAt: "",
      }

      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <div >
      <h2>Amplify Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        // style={styles.input}
        value={formState.name ? formState.name : ""}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        // style={styles.input}
        value={formState.description ? formState.description : ""}
        placeholder="Description"
      />
      <button onClick={addTodo}>Create Todo</button>
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

// const styles = {
//   container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
//   todo: {  marginBottom: 15 },
//   input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
//   todoName: { fontSize: 20, fontWeight: 'bold' },
//   todoDescription: { marginBottom: 0 },
//   button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
// }

export default App