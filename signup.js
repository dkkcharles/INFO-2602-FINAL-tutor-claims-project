async function signup(event){
  event.preventDefault();//prevent page redirect

  let form = event.target;
  let fields = event.target.elements;
  
  let data = {
    username: fields['username'].value,
    email: fields['email'].value,
    password: fields['password'].value,
  }

  //reset form
  form.reset();

  //send data to application server
  let result = await sendRequest(`${server}/signup`, 'POST', data);
  
  if('error' in result){
    toast("Signup Failed: "+result['error']);//show error message
  }else{
    toast("Signup Successful");
    window.location.href= 'index.html';//redirect the page
  }
}
//attach signup to submit event of form
document.forms['signUpForm'].addEventListener('submit', signup);