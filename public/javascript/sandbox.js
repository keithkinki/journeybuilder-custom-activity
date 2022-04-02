console.log('kn1:');
console.log(document.referrer);
var referrerJB = 'https://jbinteractions.s4.marketingcloudapps.com/'
console.log(referrerJB);

if (document.referrer === referrerJB) {
  console.log('yes'); 
} else {
  document.location="NotAuthorized.html";
}
