const OTPGenerate = (length) => {
  const number = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * number.length);
    OTP += number[random];
  }
  return OTP;
};

export default OTPGenerate;
