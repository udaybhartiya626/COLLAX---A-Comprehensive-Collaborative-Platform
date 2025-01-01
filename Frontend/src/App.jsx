import CreateMeetingScreen from "./CreateMeetingScreen";
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import MainScreen from "./MainScreens";

function App() {
    return (
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path="/" exact element={<CreateMeetingScreen />} />
                    <Route path="/meeting/:id" exact element={ <MainScreen />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
