import React from "react";

const Input = ({ name, label, error, value, ...rest }) => {
  return (
    <div className="form-group mb-3">
      <label htmlFor={name}>{label}</label>
      <input
        {...rest}
        value={value}
        id={name}
        name={name}
        className="form-control"
      />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Input;
