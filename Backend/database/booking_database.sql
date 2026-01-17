-- ============================================================
-- BASE DE DONNÉES BOOKING - STRUCTURE ET DONNÉES (AUTO-SYNC)
-- ============================================================

CREATE DATABASE IF NOT EXISTS booking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `alembic_version`;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `alembic_version` WRITE;
INSERT INTO `alembic_version` VALUES ('50cfbab86f53');
UNLOCK TABLES;
DROP TABLE IF EXISTS `amenities`;
CREATE TABLE `amenities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `amenities` WRITE;
INSERT INTO `amenities` VALUES (41,'WiFi Gratuit','fa-wifi',NULL),(42,'Climatisation','fa-snowflake',NULL),(43,'TV Écran Plat','fa-tv',NULL),(44,'Petit-déjeuner inclus','fa-mug-hot',NULL),(45,'Vue sur mer','fa-water',NULL),(46,'Coffre-fort','fa-vault',NULL),(47,'Minibar','fa-wine-bottle',NULL),(48,'Service de chambre','fa-bell-concierge',NULL);
UNLOCK TABLES;
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_reference` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `num_guests` int(11) DEFAULT NULL,
  `total_price` float NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `special_requests` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_bookings_booking_reference` (`booking_reference`),
  KEY `room_id` (`room_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `bookings` WRITE;
INSERT INTO `bookings` VALUES (1,'BK20260116FDE453',10,15,'2026-01-17','2026-01-18',1,75,'pending',NULL,'2026-01-16 22:53:49','2026-01-16 22:53:49'),(2,'BK20260116D5663C',5,9,'2026-04-01','2026-04-05',1,480,'pending',NULL,'2026-01-16 22:55:45','2026-01-16 22:55:45'),(3,'BK202601177CA818',26,45,'2026-01-17','2026-01-18',1,115,'pending',NULL,'2026-01-17 21:11:40','2026-01-17 21:11:40'),(4,'BK20260117AD516A',26,46,'2026-01-17','2026-01-18',1,85,'pending',NULL,'2026-01-17 21:19:05','2026-01-17 21:19:05'),(5,'BK202601179419FC',26,44,'2026-01-17','2026-01-25',1,760,'pending',NULL,'2026-01-17 21:33:11','2026-01-17 21:33:11');
UNLOCK TABLES;
DROP TABLE IF EXISTS `hotels`;
CREATE TABLE `hotels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `rating` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `hotels` WRITE;
INSERT INTO `hotels` VALUES (22,'Hotel Azalai','Nouakchott','L\'hôtel Azalaï Nouakchott est situé en plein centre-ville...','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',0,'2026-01-17 18:21:31'),(23,'Hotel Monotel','Nouakchott','Monotel Dar El Barka offre un cadre luxueux...','https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',4.2,'2026-01-17 18:21:31'),(24,'Hotel Tfeila','Nouadhibou','Hôtel historique avec vue sur la mer...','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',4,'2026-01-17 18:21:31'),(25,'Hotel Sahara','Atar','Au cœur du désert, le confort moderne...','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',4.3,'2026-01-17 18:21:31');
UNLOCK TABLES;
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `messages` WRITE;
INSERT INTO `messages` VALUES (1,7,5,'Question sur ma réservation','Bonjour, j\'aimerais savoir si le petit déjeuner est inclus.',1,'2026-01-16 21:52:21'),(2,5,7,'Re: Question sur ma réservation','Bonjour, oui le petit déjeuner continental est inclus dans votre offre.',1,'2026-01-16 21:52:21'),(3,7,NULL,'Problème technique','Je n\'arrive pas à modifier mes dates de séjour sur le site.',1,'2026-01-16 21:52:21'),(4,6,7,'Re: Question sur ma réservation','jf',1,'2026-01-17 18:02:08'),(5,6,7,'Re: Question sur ma réservation','bienvenue',1,'2026-01-17 18:02:26'),(6,26,NULL,'bienvenue','bienvenue',1,'2026-01-17 21:17:20'),(7,26,NULL,'Re: bienvenue','bienvenue',1,'2026-01-17 21:17:38');
UNLOCK TABLES;
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `amount` float NOT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `payments` WRITE;
INSERT INTO `payments` VALUES (1,1,75,'EUR','credit_card','TXN_BK20260116FDE453','completed','2026-01-17 00:37:08','2026-01-17 00:37:08'),(2,2,480,'EUR','credit_card','TXN_BK20260116D5663C','completed','2026-01-17 00:37:08','2026-01-17 00:37:08');
UNLOCK TABLES;
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `reviews` WRITE;
INSERT INTO `reviews` VALUES (1,5,9,5,'Excellent séjour, chambre magnifique !',1,'2026-01-17 00:37:08','2026-01-17 00:37:08'),(2,6,10,4,'Très bien, mais un peu bruyant.',1,'2026-01-16 00:37:08','2026-01-17 00:37:08'),(3,7,11,3,'Moyen, le service pourrait être amélioré.',0,'2026-01-15 00:37:08','2026-01-17 00:37:08');
UNLOCK TABLES;
DROP TABLE IF EXISTS `room_amenities`;
CREATE TABLE `room_amenities` (
  `room_id` int(11) NOT NULL,
  `amenity_id` int(11) NOT NULL,
  PRIMARY KEY (`room_id`,`amenity_id`),
  KEY `amenity_id` (`amenity_id`),
  CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`),
  CONSTRAINT `room_amenities_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `room_amenities` WRITE;
INSERT INTO `room_amenities` VALUES (41,41),(41,42),(41,44),(41,45),(41,46),(41,48),(42,41),(42,42),(42,43),(42,45),(43,41),(43,42),(43,43),(43,45),(43,46),(43,47),(44,41),(44,42),(44,44),(44,46),(44,47),(45,43),(45,45),(45,47),(45,48),(46,41),(46,43),(46,44),(46,46),(46,48),(47,41),(47,43),(47,46),(47,48),(48,41),(48,42),(48,43),(48,45),(48,47);
UNLOCK TABLES;
DROP TABLE IF EXISTS `room_images`;
CREATE TABLE `room_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` varchar(200) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `room_images_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `room_images` WRITE;
UNLOCK TABLES;
DROP TABLE IF EXISTS `room_types`;
CREATE TABLE `room_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` float NOT NULL,
  `max_occupancy` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `room_types` WRITE;
INSERT INTO `room_types` VALUES (6,'Standard',NULL,50,2);
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `room_type_id` int(11) NOT NULL,
  `hotel_id` int(11) DEFAULT NULL,
  `price_per_night` float NOT NULL,
  `floor` int(11) DEFAULT NULL,
  `size_sqm` float DEFAULT NULL,
  `bed_type` varchar(50) DEFAULT NULL,
  `max_guests` int(11) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `hotel_id` (`hotel_id`),
  KEY `room_type_id` (`room_type_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`),
  CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `rooms` WRITE;
INSERT INTO `rooms` VALUES (41,'R-39384','Chambre Standard','Belle chambre au Hotel Azalai',6,22,120,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31'),(42,'R-67195','Suite Junior','Belle chambre au Hotel Azalai',6,22,180,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31'),(43,'R-39983','Suite Présidentielle','Belle chambre au Hotel Azalai',6,22,350,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31'),(44,'R-55148','Chambre Double','Belle chambre au Hotel Monotel',6,23,95,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31'),(45,'R-54374','Chambre Vue Piscine','Belle chambre au Hotel Monotel',6,23,115,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31'),(46,'R-72581','Chambre Classique','Belle chambre au Hotel Tfeila',6,24,85,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31'),(47,'R-71298','Bungalow','Belle chambre au Hotel Sahara',6,25,75,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31'),(48,'R-84947','Tente de Luxe','Belle chambre au Hotel Sahara',6,25,90,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800','2026-01-17 18:21:31','2026-01-17 18:21:31');
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(256) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (25,'admin@hotel.com','scrypt:32768:8:1$QyvP5k3QrMZAhufU$2ac0d4c282f81aaf804182c5aee8b4653c776d46fb80a1ee5d23c85ca278b150aa5db6f637d714091f7cc39d83fe0f90a9b2a7489720a8c1b78888e36f0b847f','Admin','System','+222 12 34 56 78','admin',1,'2026-01-17 18:21:31','2026-01-17 18:21:31'),(26,'24102@supnum.mr','scrypt:32768:8:1$wLgkKBqlHlyfWJdF$044736ccccce2a52867ae8fd86083c6580d82c3ea6aebdca9bab6ef8286f8343482d74dfeee0c774851774313a3c89e958d4bbdbe1fc839047d722c1a2cec0f4','Abdurrahmane','User','+222 20103014','client',1,'2026-01-17 18:21:31','2026-01-17 21:32:39'),(27,'manager@hotel.com','scrypt:32768:8:1$Ekm7tZXzX9VAxypl$37057549659509d52e77051d174c9b5ebc5d357ceb44c7fbfa698ad1872d83b7eacbd662861804ccc1fbf1054c9fb3ac59d1b11b5b25159b64f35cb004096eed','Manager','Hotel','+222 22 33 44 55','manager',1,'2026-01-17 18:21:31','2026-01-17 18:21:31'),(28,'client@test.com','scrypt:32768:8:1$VGmpERsTzhvkANaa$4ed138f6ae3bc73ffd21591543d8923f803d3deed4ec28dacf8315c7c22b4ef4c3ff4258a5c23f061989bfea414e8752d84867e7848aaa5d22829785735c3f93','Jean','Dupont','+222 33 44 55 66','client',1,'2026-01-17 18:21:31','2026-01-17 18:21:31'),(29,'24070@supnum.mr','scrypt:32768:8:1$xy05hm1mKdqFgpie$82b50de1feda91dd85fe8c1aca56b5bd970d8c25a858b1cc25db4ebad58be75b41b2b500b120b760dcc11370ffe803b47666ddce0af0db08d2733df69b9dbe12','med mahmoud','sak','20103014','client',1,'2026-01-17 20:20:00','2026-01-17 20:21:30');
UNLOCK TABLES;

SET FOREIGN_KEY_CHECKS = 1;
