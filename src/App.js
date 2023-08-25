import Header from  './Header'
import Nav from './Nav'
import Footer from './Footer'
import Home from './Home'
import NewPost from './NewPost'
import PostPage from './PostPage'
import About from './About'
import Missing from './Missing'
import {Route, Switch, useHistory} from 'react-router-dom'
import {useState, useEffect} from 'react'
import {format} from 'date-fns'
import api from './api/posts'
import EditPost from './EditPost'
import useWindowSize from './hooks/useWindowSize'
import useAxiosFetch from './hooks/useAxiosFetch'
import { DataProvider } from './context/DataContext'

function App() {
  const [posts, setPosts] = useState([])

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [postTitle, setPostTitle] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [editBody, setEditBody] = useState('')

  const history = useHistory()

  const {width} = useWindowSize();

  const {data, fetchError, isLoading} = useAxiosFetch('http://localhost:3500/posts')

  useEffect(() => {
    setPosts(data)
  }, [data])

  useEffect(() => {
      const filteredResults = posts.filter(post => 
        ((post.body).toLowerCase()).includes(search.toLowerCase())
        || ((post.title).toLowerCase()).includes(search.toLowerCase())
        )
        setSearchResults(filteredResults.reverse())
    }, [posts, search])

  const handleSubmit = async (e) => {

    e.preventDefault()
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = {id, title: postTitle, datetime, body:postBody}
    try {
      const response = await api.post('/posts', newPost)
      const allPosts = [...posts, response.data]
      setPosts(allPosts)
      setPostTitle('')
      setPostBody('')
      history.push('/')
    }
    catch (err) {
      console.log(`Error: ${err.message}`)
    }

  }

  const handleEdit = async (id) => {

    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost = {id, title: editTitle, datetime, body:editBody}
    try {
      const response = await api.put(`/posts/${id}`, updatedPost)
      setPosts(posts.map(post => post.id === id ? {...response.data} : post))
      setEditTitle('')
      setEditBody('')
      history.push('/')
    }
    catch (err) {
      console.log(`Error: ${err.message}`)
    }

  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`)
      const postsList = posts.filter(posts => posts.id !== id)
      setPosts(postsList)
      history.push('/')
    }
    catch (err){
      console.log(`Error: ${err.message}`)
    }
  }

  return (
    <div className="App">
      <DataProvider>
        <Header title = "react js blog" />
        <Nav></Nav>
        <Switch>
          
          <Route exact path = "/" component = {Home}> 
          </Route>

          <Route exact path = "/post"> 
            <NewPost
              handleSubmit = {handleSubmit}
              postTitle = {postTitle}
              setPostTitle = {setPostTitle}
              postBody = {postBody}
              setPostBody = {setPostBody}
            ></NewPost>
          </Route>
          <Route path = "/edit/:id"> 
            <EditPost
              posts = {posts}
              handleEdit = {handleEdit}
              editTitle = {editTitle}
              setEditTitle= {setEditTitle}
              editBody = {editBody}
              setEditBody = {setEditBody}
            ></EditPost>
          </Route>

          <Route path = "/post/:id"> 
            <PostPage posts = {posts} handleDelete={handleDelete}></PostPage>
          </Route>

          <Route path = "/about" component = {About}/>
          <Route path = "*" component = {Missing}/>

        </Switch>
        <Footer></Footer>
      </DataProvider>
    </div>
  );
}

export default App;
