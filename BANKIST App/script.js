'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Hany Hosny',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-11-18T21:31:17.178Z',
    '2023-12-10T07:42:02.383Z',
    '2023-12-15T09:15:04.904Z',
    '2024-01-30T10:17:24.185Z',
    '2024-02-15T14:11:59.604Z',
    '2024-03-27T17:01:17.194Z',
    '2024-03-31T23:36:17.929Z',
    '2024-04-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'John Smith',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-11-02T13:15:33.035Z',
    '2023-11-18T09:48:16.867Z',
    '2023-12-25T06:04:23.907Z',
    '2024-01-21T14:18:46.235Z',
    '2024-02-22T16:33:06.386Z',
    '2024-03-10T14:43:26.374Z',
    '2024-03-31T18:49:59.371Z',
    '2024-04-01T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//Function to format dates of each account movement
const formatMovementDate = function (date, locale) {
  //To calculate number of days passed from the transaction day till the current day
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);
  //console.log(daysPassed);

  //Logic to implement the days passed
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0); //to add 0 (March = 03)
  // const month = `${date.getMonth() + 1}`.padStart(2, 0); // Month is a zero based
  // const year = date.getFullYear();
  // //FORMATTING DATE = Day Month Year
  // return `${day}/${month}/${year}`;

  //Formatting the transactions date based on user locale Date based on the country/language
  return new Intl.DateTimeFormat(locale).format(date);
};

//Creating a new function just to load the currency related to the current account
//Formatting the currencies
//////////////////////////////////////////////////////////////
//The following function is re-usable under any application
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//Log the movement in the container
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //The following if we use sort, function will change the original array so we need to make a copy to change it so we used slice method.
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //Funstion for format the date of each account movement and based on user locale country / language (locale)
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    //Creating a variable to the internationalization API to change the currency according to the user info. i have to locale into the account object which is acc then we defined the options which the style only
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    //we created a general function just to replace the following variable
    // new Intl.NumberFormat(acc.locale, {
    //   style: 'currency',
    //   currency: acc.currency,
    // }).format(mov);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1}
          ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//function = accumulator + current value = current sum of all previous values
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  //the following to print the total value in the web page
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  //The following to calculate the incomes
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  //THe follwing to calculate the outgoing money
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency); //Math.abs to remove the - negative sign

  //The following to calculate the bank interest
  //THe interest in one each deposit
  //on each deposit the bank will receive 1.2%..
  //we can do that craeting a new array - int = interst
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    }) // to exclude the interst that below 1
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//Creating Usernames

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0]) //REsult: (3) ['h', 'm', 'h'] ashan split return an array
      .join(''); //final result: hmh
  });
};
createUsernames(accounts);

//THis is a function to update the User Interface and to display Movements, Balance and Summary. and we called it below (updateUI(currentAccount);)
const updateUI = function (acc) {
  //Display Movements
  displayMovements(acc);
  //Display Balance
  calcDisplayBalance(acc);
  //Display Summary
  calcDisplaySummary(acc);
};

//Set Timer Function just to logout the user after 5 or 10 mins Automatically
//function division into two separate function just to let the timer works immediately
//after user logged in

const startLogOutTimer = function () {
  const tick = function () {
    //need to get rid of any remains in the 1 sec. [1(.63)]
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //In Each Call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 seconds, stop timer and logout user

    if (time === 0) {
      //Stop the timer
      clearInterval(timer);

      //Logout the user by setting the opacity back to 0
      labelWelcome.textContent = 'Log in to get started';

      containerApp.style.opacity = 0;
    }

    //Decrease 1 second
    time--;
  };

  //Setting the time to 5 mins
  let time = 120;

  //Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  //fixing timer appearence problem in the two accounts at the same time when trying to login
  // both at the same accounts
  //return the timer just to clear the timer (clearInterval function)
  return timer;
};

///////////////////////////////////////////////////////////////////////////////////////
//Event Handlers

//The Following to implenment  the login user & PIN ---- EVENT HANDLER
//the current account and the timer must be in the parent scope out the main function of the btnLogin function to be between the two users
let currentAccount, timer;

// //FAKE ALWAYS LOGGED IN - we don't have to login to do something

// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent Form from Submitting - maye3melsh reload lelpage lewa7do lazem tet7at tetmene3
  e.preventDefault();
  //To log the user in
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  //Need to check if the pin is correct first to complete login
  // ? = check if this account does raelly exist or not, if not will get undefined
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and Welcome Message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0] //to get only the first name
    }`;

    //THe following to activate the fade out and fade in

    containerApp.style.opacity = 100;

    //SETTING THE DATE under the current balance
    //creating the current date
    //Experimienting Internationalization API (locale = languange / Country).format(date we want to format) then we created options object for time hours and mins and then added after the language as a second argument into the DateTimeFormat function
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // RESULT: 4
      //month: '2-digit', // RESULT: 04
      //month: 'long', // RESULT April
      year: 'numeric',
      //year: '2-digit', //RESULT: 24
      //weekday: 'long', // RESULT: Monday
      //weekday: 'short', // RESULT: Mon
      //weekday: 'narrow', // RESULT: M
    };
    //Get from the user browser
    // const locale = navigator.language;
    // console.log(locale);

    //currentAccount.locale = to use the locale date&time language based on user locale
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0); //to add 0 (March = 03)
    // const month = `${now.getMonth() + 1}`.padStart(2, 0); // Month is a zero based
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // //FORMATTING DATE = Day Month Year
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    //Clear the input fields user and pass

    inputLoginUsername.value = inputLoginPin.value = '';

    //let the two input fields user and pass blur to loose focus
    inputLoginPin.blur();

    //Calling the logout timer function.
    //the following if i login with one user so the timer does not exist not working so the
    //timer will start immediately but at the same time i login with the second user so
    //the timer exists already but with the new login it will clear the previous working
    //timer and start a new one.
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //THis is a function to update the User Interface and to display Movements, Balance and Summary
    updateUI(currentAccount);
  }
});

//Implementing Transfers
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); // For Not reloadthe page
  //Creating Data based on the input data in the Trasnfer Fields
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  //The foloowing to clean the transfer money fields after doing the transfer

  inputTransferAmount.value = inputTransferTo.value = '';

  //Check if the transfer user has already the amount to transfer
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance > amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the Transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add Transfer Date to the transfer and receiver account

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //To Update the UI after the transfer
    //THis is a function to update the User Interface and to display Movements, Balance and Summary
    updateUI(currentAccount);

    //Reset timer whenever any transaction happens
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//Function to implement request a loan from the bank

//the loan condition  = that bank only grants a loan if there is only one deposit with at least 10% of the requested loan amount

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  //Math.floor - to round down the decimals if we enter 150.6 soit will add 150
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //Setting time for loan approval to be submitted in movements after 2.5 sec.
    setTimeout(function () {
      //Add movement
      currentAccount.movements.push(amount);

      //Add Loan Date

      currentAccount.movementsDates.push(new Date().toISOString());

      //Update UI
      updateUI(currentAccount);

      //Reset timer whenever any transaction happens
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

//Close account / delete account
// THe following to activate the close account button by adding event handler
//First to check if the user credentials are the same as the original login one

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    //Caluclating the index at which we want to delete

    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    //Delete Account
    //we will take out accounts array and splice it at a certain index(as calculated above) and we will remove exactly one element
    accounts.splice(index, 1);

    //Hide UI (log Out)
    containerApp.style.opacity = 0;
  }

  //The foloowing to clear the close account fields

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// LECTURES
