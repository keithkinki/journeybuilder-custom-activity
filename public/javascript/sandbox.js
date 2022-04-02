console.log(document.referrer);
var referrerJB = 'https://jbinteractions.${process.env.STACK}.marketingcloudapps.com'
console.log(referrerJB);

if (document.referrer === referrerJB) {
  console.log('yes'); 
}
