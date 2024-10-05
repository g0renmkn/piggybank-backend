
--
-- Table structure for table `logger`
--

CREATE TABLE `logger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` varchar(16) NOT NULL,
  `message` varchar(2048) NOT NULL,
  `module` varchar(64) NOT NULL,
  `timestamp` timestamp(3) NOT NULL,
  PRIMARY KEY (`id`)
);

