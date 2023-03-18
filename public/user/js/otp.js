const otpForm = document.getElementById("otp-form");
  const submitHandler = (event) => {
    const {
      first,
      second,
      third,
      fourth,
      state
    } = event.currentTarget;
    const otp = first.value + second.value + third.value + fourth.value;
    /**
     * Fire and forget, the server will either redirect if OTP is correct, or return
     * a static HTML response with an error message */
    // TODO: replace with actual lambda post URL
    fetch("https://www.example.com", {
      method: "POST",
      body: new URLSearchParams({
        otp,
        state: state.value
      })
    });
  };
  // Collect all the input elements first
  const inputElements = document.querySelectorAll("input[inputmode='numeric']");
  const inputElementsArray = [...inputElements];
  // Adding keyup event handler to manage traversing the focus
  otpForm.addEventListener("keyup", (event) => {
    const activeElmIdx = inputElementsArray.indexOf(event.target);
    const nextElementIdx = activeElmIdx + 1;
    const {
      key
    } = event;
    if (key === "Tab" || key === "Shift") {
      // return early and let the event propogates normally to have default action
      return;
    }
    if (key === "Backspace") {
      // backspace is pressed
      document.activeElement.value = ""; // clear the input value
      if (activeElmIdx !== 0) {
        inputElementsArray[activeElmIdx - 1].focus();
        inputElementsArray[activeElmIdx - 1].value = ""; // also clear the value
      }
      return;
    }
    if (key === "ArrowRight") {
      // move the focus to the right
      inputElementsArray[activeElmIdx + 1]?.focus();
      return;
    }
    if (key === "ArrowLeft") {
      // move the focus to the right
      inputElementsArray[activeElmIdx - 1]?.focus();
      return;
    }
    if (
      nextElementIdx < inputElementsArray.length &&
      document.activeElement.value !== ""
    ) {
      inputElementsArray[nextElementIdx].focus();
    }
    // If all the inputs have the value, we can submit the form
    if (shouldSubmitForm()) {
      submitHandler(event);
    }
  });
  // Handling keydown events to avoid enter value other than a digit
  otpForm.addEventListener("keydown", (event) => {
    if (event.key === "Tab" || event.key === "Shift") {
      // return early and let the event propogates normally to have default action
      return;
    }
    const isNumber = /^[0-9]$/i.test(event.key);
    if (!isNumber) {
      event.preventDefault();
    }
  });
  /**
   * Returns true when all the fields are filled in, false otherwise
   * @returns {Boolean} whether form should be submitted or not
   */
  const shouldSubmitForm = () => {
    let allInputFilled = true;
    inputElementsArray.forEach((el) => {
      if (el.value === "") {
        allInputFilled = false;
        return;
      }
    });
    return allInputFilled;
  };