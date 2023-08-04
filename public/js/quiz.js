var tempanswer = "";
var mp = new Map();
var arr = new Array();
var vis = new Set();
var markreveiw = new Set();

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('Useranswer')
    window.location.href = '/'
}

function fetchUser() {
    fetch(`/user/access`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'auth_token': `${localStorage.getItem('token')}`
        }
    })
        .then((res) => res.json())
        .then((body) => {
            if (body.status === 0) {
                if (body.data.stream.length === 0) {
                    window.location.href = '/data'
                }
                var html = `
                        <h1>${body.data.name}</h1>
                    <div class="otherdetail">
                        <h4>Application No : ${body.data.applicationNo},</h4>
                        <h4>Program : ${body.data.program},</h4>
                        <h4>Department : ${body.data.stream}</h4>
                    </div>
                `;
                arr = body.data.answer;
                for (const i in body.data.visited) {
                    vis.add(body.data.visited[i].key);
                }
                for (const i in body.data.review) {
                    markreveiw.add(body.data.review[i].key);
                }
                document.getElementById('Detail').innerHTML = html
                getquiz(body.data.stream);
            } else {
                localStorage.removeItem('token')
                window.location.href = '/'
            }
        })
        .catch((error) => {
            localStorage.removeItem('token')
            window.location.href = '/'
        });
}

if (localStorage.getItem('token')) {
    fetchUser();
} else {
    window.location.href = '/'
}

const getquiz = (stream) => {

    var now = new Date();
    if (now < startDate && window.location.pathname !== '/instruction') {

        window.location.href = '/instruction'
    }

    fetch(`/question/sendquestion`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            'stream': `${stream}`
        })
    })
        .then((res) => res.json())
        .then((res) => {

            if (res.status === 0) {
                displayquestion(res.data);
            }
        })
        .catch()
}

const arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
};

const displayquestion = (data) => {
    // console.log(data);
    var html = ``;
    var htQuestion = ``;
    for (var i = 0; i < data.length; i++) {
        var idxnew = (Number)(i) + 1;
        htQuestion += `<div class="short" onclick="previous(${i},${data.length},'${data[i].id}')" id="optionchoose_${data[i].id}">${i + 1}</div>`
        html += `
        <div class="mcq" id="${i}">
                <h1><span>${idxnew}.</span> ${data[i].question}</h1>
                <ul>`

        if (data[i].image.contentType) {
            // console.log('image');
            var img = arrayBufferToBase64(data[i]['image'].data.data);
            var imgSrc = `data:image/${data[i].image.contentType};base64,${img.toString('base64')}`;
            html += `<img src='${imgSrc}' alt='server error'/>`
        }
        html += `<h3>Choose option below</h3>`;
        for (j in data[i].choice) {
            // console.log(i);
            var idxoption = (Number)(j) + 1;
            html += `<li id="${data[i].id}_option${j}" onclick="setAnswer('${data[i].id}','${j}','${data[i].choice[j]}')"><span> ${String.fromCharCode(64 + idxoption)}. </span> ${data[i].choice[j]}</li>`
        }
        html += `</ul>
        <div class="answer"></div>
        <p type="submit" class="clearvalues" onclick="clearvalue(${idx},${data.length},'${data[i].id}')"> Clear all </p>
                <div class="differentquestion">`

        if (i > 0) {
            var idx = (Number)(i) - 1;
            html += `<button type="submit" onclick="previous(${idx},${data.length},'${data[idx].id}')"> Previous </button>`
        } else {
            html += `<button type="submit" disabled> Previous </button>`
        }
        html += `<div id="markReview_${data[i].id}">
            <button type="submit" onclick="markasReview('${data[i].id}')"> Mark as Review </button>
            </div>`

        if (Number(i) < data.length - 1) {
            var idx = (Number)(i) + 1;
            html += `<button type="submit" onclick="next(${idx},${data.length},'${data[idx].id}')" > Next </button>`
        } else {
            html += `<button type="submit" disabled> Next </button>`
        }

        html += `</div>`
        if (Number(i) === data.length - 1) {
            // console.log(i);
            html += `<div class="submitbutton" id="submitbuttonID">
                    <button type="submit" style ="background:blue;color:white;" onclick="submitAnswercreate()"> Submit </button>
                </div>`
        }
        html += `</div>`
    }
    document.getElementById('quizdisplay').innerHTML = html;
    document.getElementById('questionshow').innerHTML = htQuestion;

    // if (localStorage.getItem('Useranswer')) {
    //     // console.log(`here`);
    //     var value = localStorage.getItem('Useranswer');
    //     value = JSON.parse(value);
    //     // console.log(value)
    //     // mp = value;
    //     for (const key in value) {
    //         // console.log(key)
    //         // console.log(value[key])
    //         setAnswer(key, value[key].i, value[key].answer)
    //     }
    // }
    // console.log(arr);
    previous(0, data.length, data[0].id);
    for (var i in arr) {
        // console.log(i);
        setAnswer(arr[i].key, arr[i].option, arr[i].value)
    }
    startmarkasReview();
}

function previous(i, sz, quesid) {
    tempanswer = "";
    for (let index = 0; index < sz; index++) {
        var value = document.getElementById(`${index}`);
        value.style.display = 'none'
    }
    var value = document.getElementById(`${i}`);
    value.style.display = 'block'
    // console.log(quesid);
    vis.add(quesid);
    // console.log(vis);
    visitedQuestion();
    startmarkasReview();
}

function next(i, sz, quesid) {
    tempanswer = "";
    for (let index = 0; index < sz; index++) {
        var value = document.getElementById(`${index}`);
        value.style.display = 'none'
    }
    var value = document.getElementById(`${i}`);
    value.style.display = 'block';
    vis.add(quesid);
    // console.log(vis);
    visitedQuestion();
    startmarkasReview();
}


// clear answer
async function clearvalue(idx, len, id) {
    // console.log(id)
    // console.log(mp)
    mp.delete(id)
    // console.log(mp.has(id))
    // console.log(mp)
    // ${data[i].id}_option${j}

    for (let index = 0; index < 4; index++) {
        document.getElementById(`${id}_option${index}`).style.backgroundColor = `white`
    }
    document.getElementById(`optionchoose_${id}`).style.background = `red`;
    middleAnswer();
}

// answer updation

function setAnswer(id, i, answer) {
    tempanswer = answer;
    // console.log(i)
    // console.log(answer)
    if (answer === undefined) {
        return;
    }
    // if (localStorage.getItem('Useranswer')) {
    //     // console.log(`here`);
    //     var value = localStorage.getItem('Useranswer');
    //     value = JSON.parse(value);
    //     // console.log(value)
    //     mp = value;
    // }
    // mp[id] = {
    //     answer: answer,
    //     i: i
    // }
    mp.set(id, {
        answer: answer,
        i: i
    })
    // var store = JSON.stringify(mp);
    // localStorage.setItem('Useranswer', store);
    for (let index = 0; index < 4; index++) {
        var value = document.getElementById(`${id}_option${index}`);
        value.style.background = 'white';
    }
    var value = document.getElementById(`${id}_option${i}`);
    value.style.background = 'rgb(64, 145, 215)';
    // console.log(mp);
    middleAnswer();
}

const middleAnswer = () => {
    // console.log(mp);
    const arr = new Array();
    for (let key of mp.keys()) {
        // console.log(key)
        arr.push({
            key: key,
            option: mp.get(key).i,
            value: mp.get(key).answer
        })
        // console.log(value[key])
    }
    // console.log(arr);
    fetch('/user/uploadAnswermiddle', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'auth_token': `${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            answer: arr
        })
    })
        .then((res) => res.json())
        .then((res) => {
            // console.log(res);
            for (const i in arr) {
                // console.log(arr[i]);
                document.getElementById(`optionchoose_${arr[i].key}`).style.background = `green`;
            }
            startmarkasReview();
        })
        .catch()
}


// markasReview
const markasReview = (key) => {
    // console.log("mark as revie")
    markreveiw.add(key);
    startmarkasReview();
}


const startmarkasReview = () => {
    // console.log("mark as revie")
    const arr = new Array();
    markreveiw.forEach(function (key) {
        arr.push({
            key: key
        })
    })
    fetch('/user/uploadmarkasreview', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'auth_token': `${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            answer: arr
        })
    })
        .then((res) => res.json())
        .then((res) => {
            // console.log(res);
            for (const i in arr) {
                // console.log(arr[i]);
                document.getElementById(`optionchoose_${arr[i].key}`).style.background = `purple`;
                document.getElementById(`markReview_${arr[i].key}`).innerHTML = `
                <button type="submit" onclick="markasunReview('${arr[i].key}')"> Mark as Unreview </button>
                `;
            }
            // for(const i in mp){
            //     document.getElementById(`optionchoose_${i}`).style.background=`green`;
            // }
        })
        .catch()
    // console.log(arr);
}

const markasunReview = (key) => {
    markreveiw.delete(key)
    // console.log(markreveiw);
    document.getElementById(`markReview_${key}`).innerHTML = `
                <button type="submit" onclick="markasReview('${key}')"> Mark as Review </button>
                `;
    visitedQuestion();
    startmarkasReview();

}

// Visited

const visitedQuestion = () => {
    const arr = new Array();
    vis.forEach(function (key) {
        arr.push({
            key: key
        })
    })
    fetch('/user/uploadvisited', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'auth_token': `${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            answer: arr
        })
    })
        .then((res) => res.json())
        .then((res) => {
            // console.log(res);
            for (const i in arr) {
                // console.log(arr[i]);
                document.getElementById(`optionchoose_${arr[i].key}`).style.background = `red`;
            }
            for (const i of mp.keys()) {
                document.getElementById(`optionchoose_${i}`).style.background = `green`;
            }
            // markreveiw.forEach(function(key){
            //     document.getElementById(`optionchoose_${key}`).style.background=`purple`;
            // })
            startmarkasReview();

        })
        .catch()
}


const submitAnswercreate = () => {
    let data = document.getElementById('submitbuttonID');
    // You want to submit. Are you sure?
    // <select name="program" id="submitprogram" required>
    //     <option value="NO">NO</option>
    //     <option value="YES">YES</option>
    // </select>
    var newhtml = `
        <div>
            Are you want to submit?
            <button type="submit" class="submitFinal" onclick="submitAnswer()" style ="background:blue;color:white;"> YES </button>
        </div>
    `
    data.innerHTML = newhtml;
}

const submitAnswer = () => {
    // value = document.getElementById('submitprogram').value;
    // console.log(value);
    // if (value === 'NO') {
    //     return;
    // }
    // return
    // console.log(mp);
    const arr = new Array();
    for (let key of mp.keys()) {
        // console.log(key)
        arr.push({
            key: key,
            option: mp.get(key).i,
            value: mp.get(key).answer
        })
        // console.log(value[key])
    }
    // console.log(arr);
    fetch('/user/uploadAnswer', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'auth_token': `${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            answer: arr
        })
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            if (res.status === 0) {
                alert('Successfully submitted')
                logout();
            }
        })
        .catch(() => {

        })
}


const submitAnswer2 = () => {
    // var val = confirm('You want to submit. Are you sure?')
    // console.log(val);
    // if(val===false){
    //     return
    // }
    // return
    // console.log(mp);
    const arr = new Array();
    for (let key of mp.keys()) {
        // console.log(key)
        arr.push({
            key: key,
            option: mp.get(key).i,
            value: mp.get(key).answer
        })
        // console.log(value[key])
    }
    // console.log(arr);
    fetch('/user/uploadAnswer', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'auth_token': `${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            answer: arr
        })
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            if (res.status === 0) {
                alert('Successfully submitted')
                logout();
            }
        })
        .catch(() => {

        })
}
