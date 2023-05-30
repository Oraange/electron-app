// import axios from './node_modules/axios/dist/esm/axios.min.js';
import './index.html';

const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

const func = async () => {
    const response = await window.versions.ping()
    console.log(response) // prints ouot 'pong'
}

func()

const btnGetValFromDjano = document.getElementById('get');
btnGetValFromDjano = async () => {
    const res = await axios.get("http://127.0.0.1:8000/name")
    const result = res.data;
    document.getElementById('user_name').innerHTML = result;
}
