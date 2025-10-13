import React from "react";
import "./ProfileTabs.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const AddressBook = () => {
  // Mock data - sẽ thay bằng API call sau
  const addresses = [
    {
      id: 1,
      name: "Elizabeth Nguyen Thi",
      phone: "093.8332.893",
      street: "282/14, Bùi Hữu Nghĩa",
      district: "Phường 2, Quận Bình Thạnh, TP. Hồ Chí Minh",
    },
  ];

  const handleEdit = (addressId) => {
    console.log("Edit address:", addressId);
    // Open edit modal
  };

  const handleAddAddress = () => {
    console.log("Add new address");
    // Open add address modal
  };

  return (
    <div className="profile-tab-content profile-address-book">
      <div className="profile-addresses-list">
        {addresses.map((address) => (
          <div key={address.id} className="profile-address-card">
            <h3 className="profile-address-name heading-3--no-margin">{address.name}</h3>
            <p className="profile-address-phone bodytext-3--no-margin">
              {address.phone}
            </p>
            <p className="profile-address-street bodytext-3--no-margin">
              {address.street}
            </p>
            <p className="profile-address-district bodytext-3--no-margin">
              {address.district}
            </p>
            <button
              className="profile-edit-btn bodytext-3--no-margin"
              onClick={() => handleEdit(address.id)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
      <ShineGlassButton
        theme="light"
        onClick={handleAddAddress}
        className="profile-add-address-btn"
      >
        Add other Address
      </ShineGlassButton>
    </div>
  );
};

export default AddressBook;
