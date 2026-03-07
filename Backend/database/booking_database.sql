-- ============================================================
-- BASE DE DONNÉES BOOKING - STRUCTURE ET DONNÉES (AUTO-SYNC)
-- ============================================================

CREATE DATABASE IF NOT EXISTS booking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `amenities`;
CREATE TABLE `amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `amenities` WRITE;
INSERT INTO `amenities` VALUES (1,'WiFi Gratuit','fa-wifi',NULL),(2,'Climatisation','fa-snowflake',NULL),(3,'TV Écran Plat','fa-tv',NULL),(4,'Petit-déjeuner inclus','fa-mug-hot',NULL),(5,'Vue sur mer','fa-water',NULL),(6,'Service de chambre','fa-bell-concierge',NULL);
UNLOCK TABLES;
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_reference` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `room_id` int NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `num_guests` int DEFAULT NULL,
  `total_price` float NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_bookings_booking_reference` (`booking_reference`),
  KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `bookings` WRITE;
INSERT INTO `bookings` VALUES (1,'BK-1000',3,1,'2026-02-18','2026-02-20',2,240,'completed',NULL,'2026-02-16 12:16:46','2026-03-07 12:16:46'),(2,'BK-1001',3,2,'2026-03-03','2026-03-05',2,360,'completed',NULL,'2026-03-01 12:16:46','2026-03-07 12:16:46'),(3,'BK-1002',3,1,'2026-02-15','2026-02-17',2,240,'completed',NULL,'2026-02-13 12:16:46','2026-03-07 12:16:46'),(4,'BK-1003',3,1,'2026-02-17','2026-02-19',2,240,'completed',NULL,'2026-02-15 12:16:46','2026-03-07 12:16:46'),(5,'BK-1004',3,1,'2026-02-26','2026-02-28',2,240,'completed',NULL,'2026-02-24 12:16:46','2026-03-07 12:16:46'),(6,'BK20260307CD6C9B',4,4,'2026-03-07','2026-03-09',1,170,'pending',NULL,'2026-03-07 13:51:31','2026-03-07 13:51:31');
UNLOCK TABLES;
DROP TABLE IF EXISTS `hotels`;
CREATE TABLE `hotels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `views` int DEFAULT NULL,
  `unique_visitors` int DEFAULT NULL,
  `bounce_rate` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `hotels` WRITE;
INSERT INTO `hotels` VALUES (1,'Hotel Azalai','Nouakchott','L\'hôtel Azalaï Nouakchott est situé en plein centre-ville...','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',4.5,'2026-03-07 12:16:46',1,1,1,58),(2,'Hotel Monotel','Nouakchott','Monotel Dar El Barka offre un cadre luxueux...','https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',3,'2026-03-07 12:16:46',1,5,1,46),(3,'Hotel Tfeila','Nouadhibou','Hôtel historique avec vue sur la mer...','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',4,'2026-03-07 12:16:46',1,1,1,60),(4,'Hotel Sahara','Atar','Au cœur du désert, le confort moderne...','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',4.3,'2026-03-07 12:16:46',1,0,0,0);
UNLOCK TABLES;
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int DEFAULT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `messages` WRITE;
INSERT INTO `messages` VALUES (1,3,1,'Question sur ma réservation','Bonjour, j\'aimerais savoir si le petit déjeuner est inclus.',0,'2026-03-07 07:16:46'),(2,1,3,'Re: Question sur ma réservation','Oui, bien sûr !',0,'2026-03-07 08:16:46'),(3,4,NULL,'oumar','cv',0,'2026-03-07 15:22:30'),(4,4,NULL,'Re: oumar ','cc',0,'2026-03-07 15:22:44'),(5,4,NULL,'admin24070','kin',1,'2026-03-07 15:23:36'),(6,4,5,'PI','FEEEFS',1,'2026-03-07 15:35:17'),(7,4,5,'Re: PI ','xc',0,'2026-03-07 16:18:36');
UNLOCK TABLES;
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `hotel_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  KEY `hotel_id` (`hotel_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `notifications` WRITE;
INSERT INTO `notifications` VALUES (1,4,'Réservation en attente','Vous avez réservé la chambre Chambre Classique à Hotel Tfeila pour le 07/03/2026. La réservation est en attente.','booking_created',4,3,1,'2026-03-07 13:51:31');
UNLOCK TABLES;
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` float NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `screenshot_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_app` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `payments` WRITE;
INSERT INTO `payments` VALUES (1,1,240,'EUR','credit_card','TXN_BK-1000',NULL,NULL,NULL,'completed','2026-02-17 12:16:46','2026-03-07 12:16:46'),(2,2,360,'EUR','credit_card','TXN_BK-1001',NULL,NULL,NULL,'completed','2026-03-02 12:16:46','2026-03-07 12:16:46'),(3,3,240,'EUR','credit_card','TXN_BK-1002',NULL,NULL,NULL,'completed','2026-02-14 12:16:46','2026-03-07 12:16:46'),(4,4,240,'EUR','credit_card','TXN_BK-1003',NULL,NULL,NULL,'completed','2026-02-16 12:16:46','2026-03-07 12:16:46'),(5,5,240,'EUR','credit_card','TXN_BK-1004',NULL,NULL,NULL,'completed','2026-02-25 12:16:46','2026-03-07 12:16:46');
UNLOCK TABLES;
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `room_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `reply` text COLLATE utf8mb4_unicode_ci,
  `is_verified` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `reviews` WRITE;
INSERT INTO `reviews` VALUES (1,6,3,3,'zxcvdhf',NULL,0,'2026-03-07 18:22:49','2026-03-07 18:22:49');
UNLOCK TABLES;
DROP TABLE IF EXISTS `room_amenities`;
CREATE TABLE `room_amenities` (
  `room_id` int NOT NULL,
  `amenity_id` int NOT NULL,
  PRIMARY KEY (`room_id`,`amenity_id`),
  KEY `amenity_id` (`amenity_id`),
  CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `room_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `room_amenities` WRITE;
INSERT INTO `room_amenities` VALUES (1,1),(3,1),(5,1),(3,2),(4,2),(2,3),(1,4),(4,4),(2,5),(4,5),(5,5),(1,6),(2,6),(3,6),(5,6);
UNLOCK TABLES;
DROP TABLE IF EXISTS `room_images`;
CREATE TABLE `room_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `room_images_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `room_images` WRITE;
UNLOCK TABLES;
DROP TABLE IF EXISTS `room_types`;
CREATE TABLE `room_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `base_price` float NOT NULL,
  `max_occupancy` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `room_types` WRITE;
INSERT INTO `room_types` VALUES (1,'Standard',NULL,50,2);
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `room_type_id` int NOT NULL,
  `hotel_id` int DEFAULT NULL,
  `price_per_night` float NOT NULL,
  `floor` int DEFAULT NULL,
  `size_sqm` float DEFAULT NULL,
  `bed_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_guests` int DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `room_type_id` (`room_type_id`),
  KEY `hotel_id` (`hotel_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`),
  CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `rooms` WRITE;
INSERT INTO `rooms` VALUES (1,'R-769','Chambre Standard','Belle chambre au Hotel Azalai',1,1,120,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800','2026-03-07 12:16:46','2026-03-07 12:16:46'),(2,'R-589','Suite Junior','Belle chambre au Hotel Azalai',1,1,180,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800','2026-03-07 12:16:46','2026-03-07 12:16:46'),(3,'R-785','Chambre Double','Belle chambre au Hotel Monotel',1,2,95,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800','2026-03-07 12:16:46','2026-03-07 12:16:46'),(4,'R-555','Chambre Classique','Belle chambre au Hotel Tfeila',1,3,85,NULL,NULL,NULL,2,0,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800','2026-03-07 12:16:46','2026-03-07 13:51:31'),(5,'R-401','Bungalow','Belle chambre au Hotel Sahara',1,4,75,NULL,NULL,NULL,2,1,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800','2026-03-07 12:16:46','2026-03-07 12:16:46');
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_id` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_dashboard` tinyint(1) DEFAULT NULL,
  `access_control_center` tinyint(1) DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `profile_picture` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  `reset_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `ix_users_email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  UNIQUE KEY `facebook_id` (`facebook_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'24070@supnum.mr','scrypt:32768:8:1$JXTv5mUZoSyp5wdT$821e808b49bf35c037f2d5bff81396b5cdc30a28b4339eb9311e2b916558a65d9e04aff27505a52337fd251666850467e3345fb482ea3225867d67df69166aae',NULL,NULL,'Admin','Sak','+222 20103014','admin24070',1,1,'admin',1,NULL,'2026-03-07 12:16:45','2026-03-07 12:16:45',0,NULL,NULL,NULL,NULL),(2,'24102@supnum.mr','scrypt:32768:8:1$hphJ3PJeeuDEFskn$4847e6f363a32cd2e600fdd51bd8e8cd7cfc83b9a8b78b6e032421cdd2b0fb4736861c0bbec062179bdf485f479fa01b0bccf4ad625a12e20819203f8aa11ac1',NULL,NULL,'Abdurrahmane','Sak','+222 20103014','abdurrahmane24102',1,1,'admin',1,NULL,'2026-03-07 12:16:46','2026-03-07 12:16:46',0,NULL,NULL,NULL,NULL),(3,'client@test.com','scrypt:32768:8:1$ost3f2fO3Wv9kBqs$ca18e05e9cda73fa9660671034832750606d0738aab88de11326ec7b1fb98f0be26114557a57cfc61350cee1abdb97a095e85ce926d3ed9ff304098cb70dd6e0',NULL,NULL,'Jean','Dupont','+222 33 44 55 66','jdupont',0,0,'client',1,NULL,'2026-03-07 12:16:46','2026-03-07 12:16:46',0,NULL,NULL,NULL,NULL),(4,'24041@supnum.mr','scrypt:32768:8:1$CPwF0f8u4Q8s95d8$507954c5a10284ec5a5c75cea9f2c2c11b14cc81214318003023d8463fb0d2df656475e3bb736474b7dedbc8f4cd0fa1217c37596643ecdf8225f9b17601cad4','tXNDuOg8b7bzCNCxDde7qUuNITj1',NULL,'abass','med','32040505','abass',0,0,'client',1,NULL,'2026-03-07 12:22:16','2026-03-07 20:33:27',0,NULL,NULL,'Cpx6214piaXvTQ70smJNEIpMfNPIYhuunmHlP5WgRB0','2026-03-07 20:48:27'),(5,'24037@supnum.mr',NULL,'8MTURK1M1ERNJLOCBSXQFzHHfW62',NULL,'oumar','med','32040534','oumar',0,0,'client',1,NULL,'2026-03-07 13:53:42','2026-03-07 13:53:42',0,NULL,NULL,NULL,NULL),(6,'medahmed24041@gmail.com',NULL,'zyVCOBZUYLVkLZfhUUSRJ1KXuHC3',NULL,'Med','Ahmed',NULL,'med',0,0,'client',1,'https://lh3.googleusercontent.com/a/ACg8ocLumbCSaoKq3JJn735zs7v1ZBWwkwOxR0pfr7Mz_bt0Lq-0Ug=s96-c','2026-03-07 18:20:57','2026-03-07 18:20:57',1,NULL,NULL,NULL,NULL),(7,'vibepi91@gmail.com',NULL,'Xj0I2g7H8laq2oVlGPOrIVP579l2',NULL,'pi','vibe',NULL,'pi',0,0,'client',1,'https://lh3.googleusercontent.com/a/ACg8ocKmLBDH8u7J2o6UCttv-CW3ziaTkr2b2uqk3XVbxodwCN0kvQ=s96-c','2026-03-07 22:55:37','2026-03-07 22:55:37',1,NULL,NULL,NULL,NULL);
UNLOCK TABLES;

SET FOREIGN_KEY_CHECKS = 1;
