document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  
  document.querySelector('#compose-form').addEventListener('submit', sendMail);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch the emails in the current mailbox

  fetch(`/emails/${mailbox}`)
  .then(reponse => reponse.json())
  .then(emails=>{
    console.log(emails);

    emails.forEach(email =>{
      let email_div = document.createElement('div');
      email_div.className = 'email';
      if(mailbox === 'inbox'){
        email_div.innerHTML = `Sender: ${email.sender} <br>
                              Subject: ${email.subject}<br>
                              <small class='text-muted'>Time: ${email.timestamp}</small><br>
                              <button class='btn btn-primary' onclick='archive_email(${email.id})'>Archive</button>` + email_div.innerHTML;
        
        }else if(mailbox === 'archive'){
          email_div.innerHTML = `Sender: ${email.sender} <br>
                              Subject: ${email.subject}<br>
                              <small class='text-muted'>Time: ${email.timestamp}</small><br>
                              <button class='btn btn-primary' onclick='unarchive_email(${email.id})'>Un-Archive</button>` + email_div.innerHTML;
        }
        else{
              email_div.innerHTML = `Sender: ${email.sender} <br>
                                      Subject: ${email.subject}<br>
                                      <small class='text-muted'>Time: ${email.timestamp}</small><br>`
        }

      email_div.addEventListener('click', () => {
        fetch(`/emails/${email.id}`,{
          method: "PUT",
          body: JSON.stringify({
            read: true
          })
        })

        load_email(email.id,mailbox);

      })
      document.querySelector('#emails-view').appendChild(email_div)
      if(email.read === false){
        email_div.style.backgroundColor = 'white';
      }
    })
  })


}

function sendMail(){

    let recipient = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector("#compose-subject").value;
    let body = document.querySelector("#compose-body").value;

    fetch("/emails", {
      method: "POST",
      body : JSON.stringify({
        recipients : recipient,
        subject: subject,
        body: body

      })
    }).then(response => response.json())
    .then(result =>{
      console.log(result);
      load_mailbox('sent');
    })
  
}

function load_email(email_id,mailbox) {
  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    let email_detail = document.createElement('div');
    email_detail.className = 'email-detail-view';
    email_detail.innerHTML = `Sender: ${email.sender} <br>
                              Recipients: ${email.recipients}<br>
                              Subject: ${email.subject}<br>
                              Body: ${email.body}<br>
                              Time: ${email.timestamp}<br>`;
                              
  document.querySelector('#email-detail').replaceChildren(email_detail);

  if(mailbox==='inbox'){

    const reply = document.createElement('button');
        reply.className = 'btn btn-outline-primary btn-sm email-btn';
        reply.innerHTML = 'Reply';
        reply.addEventListener('click', () => reply_email(email));
        document.querySelector('#email-detail').append(reply);
  }


  })
}


function archive_email(email_id){
  fetch(`/emails/${email_id}`,{
    method: "PUT",
    body: JSON.stringify({
      archived: true
    })
  })
  .then(response => load_mailbox('inbox'))
}


function unarchive_email(email_id){
  fetch(`/emails/${email_id}`,{
    method: "PUT",
    body: JSON.stringify({
      archived: false
    })
  })
  .then(response => load_mailbox('inbox'))
}


function reply_email(email){
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-detail').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: \n\n ${email.body}`


}