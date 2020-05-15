const tabs = M.Tabs.init(document.querySelector('.tabs'));
var courses = [];
j=0;

async function displayCourses(data){

  let result = document.querySelector('#result');//access the DOM

  result.innerHTML = '';//clear result area
  
  let html = '';//make an empty html string 

  if("error" in data){//user not logged in 
    html+= `
      <li class="card collection-item col s12 m4">
                <div class="card-content">
                  <span class="card-title">
                    Error : Not Logged In
                  </span>
                </div>
        </li>
    `;
  }else{
    for(let t of data){
      html+= `
        <li class="card collection-item col s12 m4">
                  <div class="card-content">
                    <span class="card-title">${t.text}
                      <label class="right">
                        <input type="checkbox" data-id="${t.id}" onclick="toggleDone(event)" ${t.done ? 'checked': ''} />
                        <span>Done</span>
                      </label>
                    </span>
                  </div>
                  <div class="card-action">
                    <a href="#" onclick="deleteCourse('${t.id}')">DELETE</a>
                  </div>
          </li>
      `;
    }
  }
  
  //add the dynamic html to the DOM
  result.innerHTML = html;
}

async function loadView(){
  let data = await sendRequest(`${server}/courses`, 'GET');
  displayCourses(data);

  courses = [];
  j = 0;
  for (let t of data){
  
      courses[j] = t.text;
      j++;
   
  }
  

  claimsForm(courses);


}

loadView();

function claimsForm(data){
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "COURSE INFO\n";
  csvContent += "DATE   CODE   CONTACT HOURS\n"
  
  let result = document.getElementById("cform");//access the DOM

  result.innerHTML = '';//clear result area
  
  let h = '';//make an empty html string 

  if("error" in data){//user not logged in 
    h+= `
      <p>Error</p>
    `;
  }else{
    for(var i=0; i<data.length; i++){

      var d = JSON.stringify(data[i]);
      var res = d.split("-");
      var check = res[2];
      //var s = res[2] + "-" + res[3]
      var num1 = parseInt(res[2]);
      var num2 = parseInt(res[3]);
      var t = num2 - num1;
      h+= `
           
          <tr>
            <td>${res[0]}</td>
            <td>${res[1]}</td>
            <td>${res[2]}-${res[3]}</td>
            <td>${t}</td>
          </tr>
            `;

      
      
      csvContent += res[0] + "   ";
      csvContent += res[1] + "   ";
      csvContent += res[2] + "-" + res[3] + "   ";
      csvContent += t + "   ";
      csvContent += "\r\n";
    }
  }
  result.innerHTML = h;

  csvContent += "\nNAME:\nDATE:\nEMPLOYEE SIGNATURE:\n\nDATE:\nHOD SIGNATURE:";
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  link.setAttribute("title", "Download Csv");
  document.getElementById("dp").appendChild(link); // Required for FF

  link.click();
}


async function createCourse(event){
  event.preventDefault();//stop the form from reloading the page
  let form = event.target.elements;//get the form from the event object

  let data = {
    text: form['addText'].value,//get data from form
    done: false
  }

  event.target.reset();//reset form

  let result = await sendRequest(`${server}/create`, 'POST', data);

  if('error' in result){
    toast('Error: Not Logged In');
  }else{
    toast('Course Created!');
  }
    
  loadView();
}

//attach createTodo() to the submit event of the form
document.forms['addForm'].addEventListener('submit', createCourse);

async function toggleDone(event){
  let checkbox = event.target;

  let id = checkbox.dataset['id'];//get id from data attribute

  let done = checkbox.checked;//returns true if the checkbox is checked
  let result = await sendRequest(`${server}/todo/${id}`, 'PUT', {done: done});

  let message = done ? 'Done!' : 'Not Done!';
  toast(message);
}

async function deleteCourse(id){
  let result = await sendRequest(`${server}/courses/${id}`, 'DELETE');

  toast('Deleted!');

  loadView();
}

function logout(){
  window.localStorage.removeItem('access_token');
  window.location.href ="index.html";
}