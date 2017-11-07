import React, { Component } from 'react'
import { Row} from 'react-bootstrap'
import ReactDOM from 'react-dom';
import ReactAnimatedWeather from 'react-animated-weather';
import axios from 'axios'
import './css/index.css';

const APPID = '6b771b2b6b41f4b2068f3012068db7b1';
const ICON_COLOR = 'white';
const IMAGES = {
  clearDay: 'CLEAR_DAY',
  clearNight: 'CLEAR_NIGHT',
  partCloudyDay: 'PARTLY_CLOUDY_DAY',
  partCloudyNight: 'PARTLY_CLOUDY_NIGHT',
  cloudy: 'CLOUDY',
  rain: 'RAIN',
  sleet: 'SLEET',
  snow: 'SNOW',
  wind: 'WIND',
  fog: 'FOG'
}
class Weather extends Component {
  constructor(props) {
    super(props)
    this.state = {
      local: {
        lat: '',
        lon: '',
        weather: '',
        city: '',
        id: 0,
        date: '',
        timestamp: '',
        sunrise: '',
        sunset: '',
        temperature: 0,
        tempHigh: 0,
        tempLow: 0,
        description: '',
        units: 'F',
      },
    };
    this.api=this.api.bind(this);
    this.showPosition=this.showPosition.bind(this);
    this.handleChange=this.handleChange.bind(this);
  }
  componentWillMount() {
    this.getLocation();
  }
  showPosition(position) {
    const temp = Object.assign({}, this.state.local);
    temp.lat = position.coords.latitude;
    temp.lon = position.coords.longitude;
    temp.timestamp = this.convertTime(position.timestamp, temp);
    this.setState({ local : temp });
    this.api(temp);
    this.forceUpdate();
  }
  getLocation() {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);
    } else {
      return 'Geolocation is not supported by this browser.';
    }
  }
  determineIcon(id) {
    var time = this.state.local.timestamp;
    var day = this.checkIfDay(time);
    if(id >=800 && id <= 804){
      switch (id) {
        case 800:
        case 904:
          if(day) {
            return IMAGES.clearDay;
          } else return IMAGES.clearNight;
        case 801:
        case 802:
        case 803:
          if(day) {
            return IMAGES.partCloudyDay
          } else return IMAGES.partCloudyNight;
        case 804:
          return IMAGES.cloudy;
        default:
          return IMAGES.cloudy;
      }
    } else if (id >= 200 && id <= 232)
      return IMAGES.rain;
      else if (id >=300 && id <= 321) 
      return IMAGES.rain;
      else if (id >=500 && id <=531) 
      return IMAGES.rain;
      else if (id === 611 || id === 612 || id === 906)
      return IMAGES.sleet;
      else if (id >= 600 && id <= 622)
      return IMAGES.snow;    
      else if (id === 903) 
      return IMAGES.snow;
      else if (id >= 951 && id <= 962)
      return IMAGES.wind;
      else if (id === 900 || id ===905) 
      return IMAGES.wind;
      else if (id === 701 || id === 741) 
      return IMAGES.fog;
      else return IMAGES.wind
  }
  checkIfDay(time) {
    var curTime = time;
    if(curTime[0] >= 7 && curTime[8] === 'A')
      return true; 
    else if(curTime[0] < 7 && curTime[8] ==='P')
      return true;
    else if(curTime[0] === 1 && curTime[9] === 'P')
      return true;
    else return false;
  }
  convertTime(tempTime, tempLocal) {
    var newTime= '';
    var temp = tempLocal;
    var length = Math.log(tempTime) * Math.LOG10E + 1 | 0;
    if(length <= 10){
      var fixTime = tempTime + '000';
      fixTime = parseInt(fixTime, 10);
      newTime = new Date(fixTime);
    } else {
      newTime=new Date(tempTime);
    }
    if(temp.date === ''){
      temp.date = newTime.toDateString();
    }
    this.setState({local: temp });
    return(newTime.toLocaleTimeString());

  }
  api(temp) {
    var units = '';
    if(this.state.local.units === 'F'){
      units = 'imperial';
    } else units = 'metric';
    if(temp.lat !== '') {
      const myURL = 'https://api.openweathermap.org/data/2.5/weather?lat='+ temp.lat +'&lon='+ temp.lon + '&units=' + units + '&APPID='+ APPID;
      axios.get(myURL)
      .then((res)=> {
        temp.city = res.data.name;
        temp.id = res.data.id;
        temp.sunrise = this.convertTime(res.data.sys.sunrise, temp);
        temp.sunset= this.convertTime(res.data.sys.sunset, temp);
        temp.temperature= res.data.main.temp;
        temp.tempHigh= res.data.main.temp_max;
        temp.tempLow= res.data.main.temp_min;
        temp.description= res.data.weather[0].description;
        temp.weather = this.determineIcon(res.data.weather[0].id);
        temp.units = this.state.local.units;
        this.setState({ local: temp });
        this.forceUpdate();
      })
      .catch((err) =>
        console.log(err),
      );
    }
  }
  handleChange() {
    var temp = this.state.local;
    var newTemp = '';
    if(temp.units === 'F'){
      newTemp = 'C';
    } else {
      newTemp = 'F';
    }
    temp.units = newTemp;
    this.setState({local: temp});
    this.forceUpdate();
    this.api(temp);
  }
  render() {
    return (this.state.local.weather !== '') ?
      <div>
        <h3>{this.state.local.city}</h3>
        <p>{this.state.local.date} {this.state.local.timestamp}</p>
        <Row>
          <div id = 'temperatures'>
          <p>Temp:  {this.state.local.temperature} <a href = "#" onClick={this.handleChange}>°{this.state.local.units}</a></p>
          <p>High:  {this.state.local.tempLow}</p>
          <p>Low: {this.state.local.tempHigh}</p>
          </div>
          <div id='weather-icon'>
          <ReactAnimatedWeather
          icon={this.state.local.weather}
          color={ICON_COLOR}/>
          </div>
        </Row>
        <p>Weather: {this.state.local.description}</p>
        <Row>
          <div id='date-headings'>
          <p>Sunrise: </p>
          <p>Sunset:  </p>
          </div>
          <div id='date-values'>
          <p>{this.state.local.sunrise}</p>
          <p>{this.state.local.sunset}</p>
          </div>
        </Row>
        <p></p>
        <p></p>
      </div>
    : true;
  }
}

class App extends Component {
  render() {;
    return (
      <div id='weather' >
        <h1>Your Local Weather</h1>
        <Weather />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
