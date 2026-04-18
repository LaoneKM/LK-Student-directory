CREATE RE-MMOGE.db
USE RE-MMOGO.db
CREATE TABLE USER (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    member_id INT,
    FOREIGN KEY (member_id) REFERENCES MEMBER(member_id)
);
CREATE TABLE MEMBER (
    member_id INT PRIMARY KEY,
    member_name VARCHAR(70),
    group_id INT FOREIGN KEY,
    date_joined DATE
    );
CREATE TABLE GROUP (
    group_id INT PRIMARY KEY,
    group_name VARCHAR(70)
    date_created date,
    status VARCHAR(60)
    );
CREATE TABLE REPORT (
     report_id INT PRIMARY KEY,
     group_id INT,
     year INT,
     total_contribution DECIMAL(10,2),
     total_loans DECIMAL(10,2),
     interested_generated DECIMAL(10,2),
     FOREIGN KEY(group_id) REFERENCE GROUP(group_id)
     );
CREATE TABLE SIGNATORY (
     signatory_id INT PRIMARY KEY,
     member_id INT,
     group_id INT,
     assigned_date DATE,
     FOREIGN KEY(member_id) REFERENCE MEMBER(member_id),
     FOREIGN KEY(group_id) REFERENCE GROUP(group_id)
     );
CREATE TABLE CONTRIBUTION (
     contribution_id INT PRIMARY KEY,
     contribution_amount DECIMAL(10,2),
     member_id INT FOREIGN KEY,
     contribution_month VARCHAR
     );
CREATE TABLE LOAN (
      loan_id INT PRIMARY KEY,
      member_id INT FOREIGN KEY,
      loan_amount DECIMAL(10,2),
      loan_month VARCHAR(10,2),
      interest_rate DECIMAL(10,2) DEFAULT 20 %
      FOREIGN KEY(member_id) REFERENCE MEMBER(member_id)
      );
CREATE TABLE PAYMENT (
      payment_id INT PRIMARY KEY,
      member_id INT,
      amount of payment DECIMAL(10,2),
      payment_date DATE,
      type VARCHAR(60),
      remaining_balance DECIMAL(10,2),
      FOREIGN KEY(member_id) REFERENCE MEMBER(member_id)
      );
CREATE TABLE TRANSACTION_APPROVAL (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type VARCHAR(20), 
    approval status VARCHAR(30),
    signatory_id INT,
    approval_date DATE,
    
    FOREIGN KEY (signatory_id) REFERENCES SIGNATORY(signatory_id)
);
  SELECT m.member_id,g.group_name
  FROM member m
  JOIN GROUP g ON m.group_id = g.group_id
  WHERE m.member_id
   
   SELECT
   loan_id,
   member_id,
   loan_amount AS balance,
   loan_amount* 0.20 AS interest,
   loan_amont+(loan_amount*0.20) AS new_balance
   FROM LOAN;
   
   SELECT member_id, SUM(contribution_amount) AS total_contributions
   FROM contribution
   GROUP BY member_id;
   
   SELECT g.group_name, r.year, r.total_contribution, r.total_loans
   FROM report r
   JOIN GROUP g ON r.group_id=g,group_id;
   
   SELECT member_id, SUM(amount_of_payment) AS total_payment
   FROM payment
   GROUP BY member_id;
   
    SELECT
        member_id,
        SUM(contribution_amount) AS total_paid
        FROM contribution_amount
        WHERE contribution_month = 'January'
        GROUP BY member_id
        HAVING total = 1000;
        
    SELECT m.member_id,m.member_name
     FROM MEMBER m
     LEFT JOIN contribution c
            ON m.member_id = c.member_id
            AND c.contribution_month = 'January'
      WHERE c.member_id IS NULL

   SELECT member_id, m.member_name, SUM(l.loan_amount*(l.interest_rate/ 100)) AS total_interest
   FROM member m
   LEFT JOIN LOAN l ON m.member_id = l.member_id = l.member_id
   WHERE l.approval_status = 'APPROVED'
   GROUP BY m.member_id,m.member_name
   HAVING total_interest >= 5000;
 
   SELECT 
       l.member_id,
       l.loan_amount,
       IFNULL(SUM(p.amount_of_payment), 0) AS total_paid,
       l.loan_amount - IFNULL(SUM(p.amount_of_payment), 0) AS balance
      FROM LOAN l
      LEFT JOIN PAYMENT p
         ON l.member_id = p.member_id-id
         AND p.approval_status = 'APPROVED'
      GROUP BY l.member_id,l.loan_amount;
      
    ALTER TABLE contribution
    ADD CONSTRAINT check_contribution_amount
    CHECK (contribution_amount = 1000);
    
    SELECT transaction_id,
      COUNT(DISTINCT signatory_id) AS approval_status
      FROM transactional_approval
      WHERE transaction_type = 'LOAN'
      GROUP BY transactioin_id
      HAVING approvals >= 2;
      
       
      