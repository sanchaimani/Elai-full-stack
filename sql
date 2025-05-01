CREATE TABLE ussers.usersdetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    friend VARCHAR(100),
    friendnumber BIGINT,
    name VARCHAR(100),
    yournumber BIGINT,
    pincode INT,
    address TEXT,
    ref_id VARCHAR(10) UNIQUE
);
select * from ussers.usersdetails;
