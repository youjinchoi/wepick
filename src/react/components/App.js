import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './gnb/Header';
import Footer from './gnb/Footer';
import QuestionList from './QuestionList';
import QuestionForm from './QuestionForm';
import Login from './Login';

const App = () => {
	return (
		<Router basename="/admin">
			<div>
		        <Header />
				<Switch>
					<Route exact path="/" render={() => <QuestionList />}/>
					<Route exact path="/questions" render={() => <QuestionList />}/>
					<Route exact path="/questions/form" render={() => <QuestionForm />}/>
					<Route exact path="/login" render={() => <Login />}/>
				</Switch>
	        </div>
		</Router>
	);
}

export default App;