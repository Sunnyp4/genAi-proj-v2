import { RouterProvider } from "react-router"
import { useState } from 'react'
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <AuthProvider>
        <InterviewProvider>
          <ToastContainer />
        <RouterProvider router={router} />
      </InterviewProvider>
      
    </AuthProvider>

    </>
  )
}

export default App
