import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import M from 'materialize-css';
import questions from '../../questions.json';
import isEmpty from '../../utils/is-empty';
import correctNotification from '../../assets/audio/crash.mp3';
import wrongNotification from '../../assets/audio/kick-bass.mp3';
import buttonSound from '../../assets/audio/snare.mp3';
import "./playstyle.css";

class Play extends Component {
    constructor (props) {
        super(props);
        this.state ={
            questions,
            currentQuestion:{},
            nextQuestion:{},
            previousQuestion: {},
            answer: '',
            numberOfQuestions: 0,
            numberOfAnsweredQuestions:0,
            currentQuestionIndex: 0,
            score: 0,
            correctAnswers: 0,
            wrongAnswers:0,
            hints:5,
            fiftyFifty:2,
            usedFiftyFifty:false,
            nextButtonDisabled: false,
            previousButtonDisabled: true,
            previousRandomNumbers: [],
            time:{}
        };     
        this.interval = null 
    }

    componentDidMount () {
        const { questions, currentQuestion, nextQuestion, previousQuestion } = this.state;
        this.displayQuestions(questions,currentQuestion,nextQuestion, previousQuestion);
        this.startTimer();
    }

    

      displayQuestions = (questions = this.state.questions, currentQuestion, nextQuestion, previousQuestion) => {
          let {currentQuestionIndex} = this.state; 
          if (!isEmpty(this.state.questions)) {
              questions = this.state.questions;
              currentQuestion = questions[currentQuestionIndex];
              nextQuestion = questions[currentQuestionIndex + 1];
              previousQuestion= questions[currentQuestionIndex-1];
              const answer = currentQuestion.answer;
              this.setState({
                  currentQuestion,
                  nextQuestion,
                  previousQuestion,
                  numberOfQuestions: questions.length,
                  answer,
                  previousRandomNumbers: []
              }, () => {
                  this.showOptions();
                  this.handleDisableButton();
              });
          }
      };

      handleOptionClick =(e) => {
         if (e.target.innerHTML.toLowerCase()=== this.state.answer.toLowerCase()){
             document.getElementById('correct-sound').play();
            this.correctAnswer();
            } 
            else {
             document.getElementById('wrong-sound').play();
                this.wrongAnswer()
            } 
      }

      handleNextButtonClick = ()=>{
          this.playButtonSound();
          if (this.state.nextQuestion !== undefined){
             this.setState(prevState => ({
                 currentQuestionIndex: prevState.currentQuestionIndex + 1
             }), ()=>{
                 this.displayQuestions(this.state.state, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion);
             });
          }
      };

      handlePreviousButtonClick = ()=>{
        this.playButtonSound();
        if (this.state.previousQuestion !== undefined){
           this.setState(prevState => ({
               currentQuestionIndex: prevState.currentQuestionIndex - 1
           }), ()=>{
               this.displayQuestions(this.state.state, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion);
           });
        }
    };

       handleQuitButtonClick = ()=> {
           this.playButtonSound();
           if (window.confirm('Are You Sure You Want To End Your Game?')){
               this.props.history.push('/');
              
           }
       };

      handleButtonClick = (e)=> {
          switch (e.target.id){
              case 'next-button':
                  this.handleNextButtonClick();
                  break;

              case 'previous-button':
                this.handlePreviousButtonClick();
                break;

             case 'quit-button':
                this.handleQuitButtonClick();
                break;

              default:
                 break;
          }
          

      };

      playButtonSound = () =>{
          document.getElementById('button-sound').play();
      }

      correctAnswer = () =>{
          M.toast({
              html: 'Correct Answer!!!',
              classes: 'toast-valid',
              displayLength: 1500
          });
          this.setState(prevState =>({
              score: prevState.score + 1,
              correctAnswers: prevState.correctAnswers + 1,
              currentQuestionIndex: prevState.currentQuestionIndex + 1,
              numberOfAnsweredQuestions:prevState.numberOfAnsweredQuestions + 1
          }), ()=>{
            if(this.state.nextQuestion === undefined){
                this.endGame();
            } else {
             this.displayQuestions(this.state.questions, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion)
            }
          });
      }
         
      wrongAnswer = () =>{
        navigator.vibrate(1000)
        M.toast({
            html: 'Wrong Answer!!!',
            classes: 'toast-valid',
            displayLength: 1500
        });
        this.setState(prevState =>({
           wrongAnswers: prevState.wrongAnswers + 1,
           currentQuestionIndex: prevState.currentQuestionIndex + 1,
           numberOfAnsweredQuestions: prevState.numberOfAnsweredQuestions + 1
        }), ()=> {
            if(this.state.nextQuestion === undefined){
                this.endGame();
            } else {
             this.displayQuestions(this.state.questions, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion);
            }
        });
    }
     showOptions = () => {
         const options = Array.from(document.querySelectorAll('.option'));

         options.forEach(option => {
             option.style.visibility = 'visible';
         });

         this.setState({
             usedFiftyFifty: false
         });
     }
     handleHints = () => {
         if (this.state.hints > 0){
           
            const options = Array.from(document.querySelectorAll('.option'));
            let indexOfAnswer;       
   
            options.forEach((option, index) => {
                if (option.innerHTML.toLowerCase()=== this.state.answer.toLowerCase()){
                    indexOfAnswer = index;
                }
            });
   
            while (true) {
                const randomNumber = Math.round(Math.random() * 3);
                if (randomNumber !== indexOfAnswer && !this.state.previousRandomNumbers.includes(randomNumber)){
                    options.forEach((option, index) => {
                        if (index === randomNumber) {
                            option.style.visibility = 'hidden';
                            this.setState((prevState)=>({
                               hints: prevState.hints - 1,
                               previousRandomNumbers: prevState.previousRandomNumbers.concat(randomNumber)
                            }));
                        }
                    });
                    break;
                }
                if (this.state.previousRandomNumbers.length >= 3) break;
            }  
         }
     }

     handleFiftyFifty = ()=>{
         if (this.state.fiftyFifty > 0 && this.state.usedFiftyFifty === false ){
             const options = document.querySelectorAll('.option');
             const randomNumbers = [];
             let indexOfAnswer;

             options.forEach((option, index) => {
                 if (option.innerHTML.toLowerCase()=== this.state.answer.toLowerCase()) {
                     indexOfAnswer = index;
                 }
             });
             let  count =0;
             do{
               const randomNumber = Math.round(Math.random()* 3);
               if (randomNumber !== indexOfAnswer){
                   if (randomNumbers.length < 2 && !randomNumbers.includes(randomNumber) && !randomNumbers.includes(indexOfAnswer)){
                       randomNumbers.push(randomNumber);
                       count ++;
                   } else {
                       while (true){
                           const newRandomNumber = Math.round(Math.random() * 3); 
                           if (!randomNumbers.includes(newRandomNumber) && !randomNumbers.includes(indexOfAnswer)){
                               randomNumbers.push(newRandomNumber);
                               count ++;
                               break;
                           }
                       }
                   }
               }
             } while (count < 2);
             options.forEach((option, index) => {
                 if (randomNumbers.includes(index)){
                     option.style.visibility = 'hidden';
                 }
             });
             this.setState(prevState => ({
                 fiftyFifty: prevState.fiftyFifty -1,
                 usedFiftyFifty: true
             }));
         }
     }

     startTimer = () => {
         const countDownTime = Date.now() + 180000;
         this.interval = setInterval(()=> {
             const now = new Date();
             const distance = countDownTime - now;

             const minutes = Math.floor((distance % (1000 * 60 * 60))/(1000 * 60));
             const seconds = Math.floor((distance % (1000 * 60))/1000);

             if (distance < 0){
                 clearInterval(this.interval);
                 this.setState({
                     time: {
                         minutes: 0,
                         seconds: 0
                     }
                    }, () =>{
                       this.endGame();
                 });
             } else {
                 this.setState({
                     time: {
                         minutes,
                         seconds
                     }
                 });
             }
         },1000);
     }

     handleDisableButton = ()=> {
         if (this.state.previousQuestion === undefined || this.state.currentQuestionIndex === 0){
             this.setState({
                 previousButtonDisabled: true
             });
         } else {
            this.setState({
                previousButtonDisabled: false
            });
         }

         if (this.state.nextQuestion === undefined || this.state.currentQuestionIndex + 1 === this.state.numberOfQuestions){
            this.setState({
                nextButtonDisabled: true
            });
        } else {
           this.setState({
               nextButtonDisabled: false
           });
        }

     }

     endGame = ()=>{
         alert('Game has ended');
         const {state} = this;
         const playerStats = {
             score: state.score,
             numberofQuestions: state.numberOfQuestions,
             numberOfAnsweredQuestions: state.numberOfAnsweredQuestions,
             correctAnswers: state.correctAnswers,
             wrongAnswers: state.wrongAnswers,
             fiftyFiftyUsed: 2 - state.fiftyFifty, 
             hintsUsed: 5- state.hints
         };
         console.log(playerStats);
         setTimeout(() => {
             this.props.history.push('/');
         }, 1000);
     }
          
    render () {
        const { 
            currentQuestion, 
            currentQuestionIndex, 
            fiftyFifty, 
            hints, 
            numberOfQuestions,
            time
         } = this.state;
        
         return(
            <Fragment>
                <Helmet><title>Be A Software Engineer!</title></Helmet>
                <Fragment>
                    <audio id="correct-sound" src={correctNotification}></audio>
                    <audio id="wrong-sound" src={wrongNotification}></audio>
                    <audio id="button-sound" src={buttonSound}></audio>
                </Fragment>
                <div className="questions quiz-continer">
                    <div className="quiz-inner-container">
                    <div className="lifeline-container">
                        <p>
                    <span onClick={this.handleFiftyFifty}className=" mdi-set-center mdi-24px lifeline-icon">Life-Line</span>
                        <span className="lifeline">{fiftyFifty}</span>
                        </p>
                        <p>
                    <span onClick={this.handleHints} className=" mdi mdi-lightbulb-on-outline mdi-24px lifeline-icon"></span> 
                            <span className='lifeline' >{hints}</span>
                            {/* <span>{hints}</span> */}
                        </p>
                    </div>
                    {/* <span>1 of 15</span>
                            <span className="mdi mdi-clock-outline mdi-24px">Clock will go here [[possibly]]</span> */}
                    <div className="timer-container">
                        <p>
                            <span>{currentQuestionIndex + 1} of {numberOfQuestions}</span>
                           <span className="right">{time.minutes}:{time.seconds}<span className="mdi mdi-clock-outline mdi-24px">Clock will go here</span></span>
                        </p>
                    </div>

                    <h5 className="question-title">{currentQuestion.question}</h5>
                
                   <div className="options-container">
                        <button className="option-btn"><p onClick={this.handleOptionClick} className="option">{currentQuestion.optionA}</p></button><br></br>
                        <button className="option-btn"><p  onClick={this.handleOptionClick}className="option">{currentQuestion.optionB}</p></button>
                  </div>

                  <div className="options-container">
                        <button className="option-btn"><p onClick={this.handleOptionClick} className="option">{currentQuestion.optionC}</p></button><br></br>
                        <button className="option-btn"><p onClick={this.handleOptionClick} className="option">{currentQuestion.optionD}</p></button>
                  </div>

                  <div className="button-container">
                  <button id="previous-button" className="nav-btn" onClick={this.handleButtonClick}>Previous</button>
                      <button id="next-button" className="nav-btn" onClick={this.handleButtonClick}>Next</button>
                      <button id="quit-button" className="nav-btn" onClick={this.handleButtonClick}>Quit</button>
                      {/* <button className="quit" type="submit"><a href="/">Quit Game</a></button> */}
                      {/* <button 
                            className={('', {'disable': this.state.previousButtonDisabled})}
                            id="previous-button" 
                            onClick={this.handleButtonClick}>
                            Previous
                          </button>
                      <button 
                            className={('', {'disable': this.state.nextButtonDisabled})}
                            id="next-button"   
                            onClick={this.handleButtonClick}>
                            Next
                         </button>
                      <button id="quit-button" onClick={this.handleButtonClick}>QuitGame</button> */}
                  </div>
                    </div>

                </div>
            </Fragment>
           
        );
    }
}



export default Play;