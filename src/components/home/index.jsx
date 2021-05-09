import React, { useState, useEffect } from "react";
import { Howl } from "howler";
import { fetchCenterList } from "../../service";
import Input from "../common/input";
import audioFile from "./../../assets/audio/alarm.mp3";

function Home() {
  const [data, setData] = useState({
    pincode: "",
    date: "",
    age: "",
  });

  const sound = new Howl({
    src: [audioFile],
  });

  const [looking, setLooking] = useState(false);
  const [errors, setErrors] = useState({ pincode: "", age: "" });
  const [intervalId, setIntervalId] = useState(null);
  const [found, setFound] = useState(false);

  useEffect(() => {
    clearInterval(intervalId);
    handleStop();
  }, [found]);

  useEffect(() => {
    setData((prev) => ({ date: getTodayDate() }));
  }, []);

  const handleChange = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    const { message } = validate(name, value);
    const newErrors = { ...errors };
    if (message) {
      newErrors[name] = message;
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);

    setData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (name, value) => {
    const error = { message: "" };

    if (name === "age") {
      const num = Number(value);
      if (!value) {
        error.message = "Age can't be left blank.";
      } else if (isNaN(num)) {
        error.message = "Enter a valid age.";
      } else if (num < 18 || num > 120) {
        error.message = "Age should be in between in 18 - 120.";
      }
    }

    if (name === "pincode") {
      const num = Number(value);
      if (!value) {
        error.message = "Pin-Code can't be left blank.";
      } else if (isNaN(num)) {
        error.message = "Enter a valid pin-code.";
      } else if (!isNaN(num) && value.length < 6) {
        error.message = "Pin-Code should be of 6 digit.";
      }
    }

    return error;
  };

  const getTodayDate = () => {
    const formateDate = (value) => {
      return value < 10 ? `0${value}` : value;
    };
    const obj = new Date();
    const DD = formateDate(obj.getDate());
    const MM = formateDate(obj.getMonth() + 1);
    const YYYY = obj.getFullYear();

    return `${YYYY}-${MM}-${DD}`;
  };

  const toDisabled = () => {
    return Object.keys(errors).length > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLooking(true);
    const interval_Id = setInterval(() => {
      startLooking();
    }, 5000);
    setIntervalId(interval_Id);
  };

  const startLooking = async () => {
    const { pincode, date: selectedDate, age } = data;
    const date = selectedDate.split("-").reverse().join("-");
    const centres = await fetchCenterList({ pincode, date });
    if (centres.length === 0) {
      alert("Couldn't find any center.");
      setLooking(false);
      clearInterval(intervalId);
    } else {
      startedLooking(centres, age);
    }
  };

  const startedLooking = (centres, age) => {
    const foundCentres = [];

    for (let i = 0; i < centres.length; ++i) {
      const { sessions } = centres[i];
      for (let j = 0; j < sessions.length; ++j) {
        const { min_age_limit, available_capacity } = sessions[j];
        if (age >= min_age_limit && available_capacity > 0) {
          foundCentres.push(centres[i].name);
        }
      }
    }
    if (foundCentres.length > 0) {
      sound.play();
      setFound(true);
      setTimeout(() => {
        alert(foundCentres.join(" , "));
        handleStop();
      }, 1000);
    }
  };

  const handleStop = () => {
    setLooking(false);
    clearInterval(intervalId);
    sound.pause();
  };

  return (
    <div className="col-6 mt-5 mx-auto">
      <h6 className="mb-3 d-flex justify-content-center">
        Made with ❤ by Rohit
      </h6>
      <form onSubmit={handleSubmit}>
        <Input
          label="Age"
          name="age"
          value={data.age}
          placeholder="Enter your age"
          type="text"
          onChange={handleChange}
          error={errors.age}
          disabled={looking}
        />
        <Input
          label="Pick Date"
          name="date"
          type="date"
          value={data.date}
          onChange={handleChange}
          disabled={looking}
        />
        <Input
          label="PIN Code"
          name="pincode"
          type="text"
          value={data.pincode}
          onChange={handleChange}
          error={errors.pincode}
          disabled={looking}
        />

        <div>
          <button
            className="btn btn-primary mr-3"
            type="submit"
            disabled={toDisabled() || looking}>
            {looking && (
              <span className="spinner-grow spinner-grow-sm ml-1"></span>
            )}
            {looking ? "Looking..." : "Look"}
          </button>
          {looking && (
            <button className="btn btn-danger" onClick={handleStop}>
              Stop
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Home;
