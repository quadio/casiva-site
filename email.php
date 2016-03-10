<?php

// Change this only !
$EmailTo = "arnoldck@live.com";

$name = $_POST["name"];
$email = $_POST["email"];
$message = $_POST["message"];
$subject = $_POST["subject"];
$number = $_POST["number"] ? : "No Number";

// prepare email body text
$Body .= "Name: ";
$Body .= $name;
$Body .= "\n";
 
$Body .= "Email: ";
$Body .= $email;
$Body .= "\n";

$Body .= "Contact Number: ";
$Body .= $number;
$Body .= "\n\n";
 
$Body .= "Message:\n";
$Body .= $message;
$Body .= "\n";
 
// send email
$success = mail($EmailTo, $subject, $Body, "From:".$email);
 
// redirect to success page
if ($success){
   echo "success";
}else{
   echo "failed";
}
 
?>