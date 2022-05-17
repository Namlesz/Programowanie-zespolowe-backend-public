function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generatePassword(length: number): string {
  let password: string = "";
  for (let i = 0; i < length; i++) {
    let char_type = getRandomInt(0, 3);
    let ascii: number;

    //numbers
    if (char_type == 0) ascii = getRandomInt(48, 57);
    //caption letters
    else if (char_type == 1) ascii = getRandomInt(65, 90);
    //small letters
    else ascii = getRandomInt(97, 122);

    password += String.fromCharCode(ascii);
  }
  return password;
}
export const saltRounds = 10;
export default generatePassword;
