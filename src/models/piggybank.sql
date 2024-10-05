--
-- Database: `piggybank`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `iban` varchar(34) NOT NULL,
  `closed` varchar(30) DEFAULT '',
  `comments` varchar(100) DEFAULT '',
  `pfp` varchar(100) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `iban` (`iban`)
);

-- --------------------------------------------------------

--
-- Table structure for table `data_asset_types`
--

CREATE TABLE `data_asset_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);

--
-- Dumping data for table `data_asset_types`
--

INSERT INTO `data_asset_types` (`id`, `name`) VALUES
(1, 'fiat'),
(2, 'crypto'),
(3, 'stock'),
(4, 'fund');

-- --------------------------------------------------------

--
-- Table structure for table `data_bank_periodicities`
--

CREATE TABLE `data_bank_periodicities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);

--
-- Dumping data for table `data_bank_periodicities`
--

INSERT INTO `data_bank_periodicities` (`id`, `name`) VALUES
(1, 'one_time'),
(2, 'weekly'),
(3, 'biweekly'),
(4, 'monthly'),
(5, 'quarterly'),
(6, 'yearly');

-- --------------------------------------------------------

--
-- Table structure for table `data_mov_types`
--

CREATE TABLE `data_mov_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);

--
-- Dumping data for table `data_mov_types`
--

INSERT INTO `data_mov_types` (`id`, `name`) VALUES
(1, 'deposit'),
(2, 'withdrawal'),
(3, 'trade'),
(4, 'airdrop'),
(5, 'mining_reward'),
(6, 'fut_open_long'),
(7, 'fut_close_long'),
(8, 'fut_liq_long'),
(9, 'fut_open_short'),
(10, 'fut_close_short'),
(11, 'fut_liq_short');
