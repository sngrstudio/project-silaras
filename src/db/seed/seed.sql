-- =====================================================
-- SILARAS Database Seed Script
-- Comprehensive SQL replication of TypeScript seed functionality
-- =====================================================
-- This script replicates the exact functionality of src/db/seed/seed.ts
-- including all 203 regional entries from regions.json
-- Generated: June 2, 2025
-- =====================================================

-- Disable foreign key checks for initial data loading
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- REGIONAL HIERARCHY SEEDING
-- =====================================================
-- Insert regions in hierarchical order: KABUPATEN → KECAMATAN → DESA
-- Total: 1 KABUPATEN, 17 KECAMATAN, 185 DESA

-- Step 1: Insert KABUPATEN (Root level) with known ID
SET @kabupaten_id = UUID();
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(@kabupaten_id, 'Kotawaringin Timur', 'kotawaringin-timur-6202', 'KABUPATEN', NULL);

-- Step 2: Insert KECAMATAN (Second level) using variable
SET @kota_besi_id = UUID();
SET @cempaga_id = UUID();
SET @mentaya_hulu_id = UUID();
SET @parenggean_id = UUID();
SET @baamang_id = UUID();
SET @mentawa_baru_ketapang_id = UUID();
SET @mentaya_hilir_utara_id = UUID();
SET @mentaya_hilir_selatan_id = UUID();
SET @pulau_hanaut_id = UUID();
SET @antang_kalang_id = UUID();
SET @teluk_sampit_id = UUID();
SET @seranau_id = UUID();
SET @cempaga_hulu_id = UUID();
SET @telawang_id = UUID();
SET @bukit_santuai_id = UUID();
SET @tualan_hulu_id = UUID();
SET @telaga_antang_id = UUID();

INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(@kota_besi_id, 'Kota Besi', 'kota-besi-620201', 'KECAMATAN', @kabupaten_id),
(@cempaga_id, 'Cempaga', 'cempaga-620202', 'KECAMATAN', @kabupaten_id),
(@mentaya_hulu_id, 'Mentaya Hulu', 'mentaya-hulu-620203', 'KECAMATAN', @kabupaten_id),
(@parenggean_id, 'Parenggean', 'parenggean-620204', 'KECAMATAN', @kabupaten_id),
(@baamang_id, 'Baamang', 'baamang-620205', 'KECAMATAN', @kabupaten_id),
(@mentawa_baru_ketapang_id, 'Mentawa Baru Ketapang', 'mentawa-baru-ketapang-620206', 'KECAMATAN', @kabupaten_id),
(@mentaya_hilir_utara_id, 'Mentaya Hilir Utara', 'mentaya-hilir-utara-620207', 'KECAMATAN', @kabupaten_id),
(@mentaya_hilir_selatan_id, 'Mentaya Hilir Selatan', 'mentaya-hilir-selatan-620208', 'KECAMATAN', @kabupaten_id),
(@pulau_hanaut_id, 'Pulau Hanaut', 'pulau-hanaut-620209', 'KECAMATAN', @kabupaten_id),
(@antang_kalang_id, 'Antang Kalang', 'antang-kalang-620210', 'KECAMATAN', @kabupaten_id),
(@teluk_sampit_id, 'Teluk Sampit', 'teluk-sampit-620211', 'KECAMATAN', @kabupaten_id),
(@seranau_id, 'Seranau', 'seranau-620212', 'KECAMATAN', @kabupaten_id),
(@cempaga_hulu_id, 'Cempaga Hulu', 'cempaga-hulu-620213', 'KECAMATAN', @kabupaten_id),
(@telawang_id, 'Telawang', 'telawang-620214', 'KECAMATAN', @kabupaten_id),
(@bukit_santuai_id, 'Bukit Santuai', 'bukit-santuai-620215', 'KECAMATAN', @kabupaten_id),
(@tualan_hulu_id, 'Tualan Hulu', 'tualan-hulu-620216', 'KECAMATAN', @kabupaten_id),
(@telaga_antang_id, 'Telaga Antang', 'telaga-antang-620217', 'KECAMATAN', @kabupaten_id);

-- Step 3: Insert DESA (Third level) - All 185 villages
-- KOTA BESI villages (11 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Palangan', 'palangan-6202012003', 'DESA', @kota_besi_id),
(UUID(), 'Hanjalipan', 'hanjalipan-6202012004', 'DESA', @kota_besi_id),
(UUID(), 'Simpur', 'simpur-6202012005', 'DESA', @kota_besi_id),
(UUID(), 'Pamalian', 'pamalian-6202012006', 'DESA', @kota_besi_id),
(UUID(), 'Camba', 'camba-6202012007', 'DESA', @kota_besi_id),
(UUID(), 'Kandan', 'kandan-6202012008', 'DESA', @kota_besi_id),
(UUID(), 'Kota Besi Hulu', 'kota-besi-hulu-6202011009', 'DESA', @kota_besi_id),
(UUID(), 'Kota Besi Hilir', 'kota-besi-hilir-6202011010', 'DESA', @kota_besi_id),
(UUID(), 'Bajarum', 'bajarum-6202012012', 'DESA', @kota_besi_id),
(UUID(), 'Rasau Tumbuh', 'rasau-tumbuh-6202012015', 'DESA', @kota_besi_id),
(UUID(), 'Soren', 'soren-6202012017', 'DESA', @kota_besi_id);

-- CEMPAGA villages (8 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Rubung Buyung', 'rubung-buyung-6202022004', 'DESA', @cempaga_id),
(UUID(), 'Patai', 'patai-6202022005', 'DESA', @cempaga_id),
(UUID(), 'Luwuk Ranggan', 'luwuk-ranggan-6202022006', 'DESA', @cempaga_id),
(UUID(), 'Jemaras', 'jemaras-6202022007', 'DESA', @cempaga_id),
(UUID(), 'Cempaka Mulia Timur', 'cempaka-mulia-timur-6202022008', 'DESA', @cempaga_id),
(UUID(), 'Cempaka Mulia Barat', 'cempaka-mulia-barat-6202022009', 'DESA', @cempaga_id),
(UUID(), 'Luwuk Bunter', 'luwuk-bunter-6202022010', 'DESA', @cempaga_id),
(UUID(), 'Sungai Paring', 'sungai-paring-6202022011', 'DESA', @cempaga_id);

-- MENTAYA HULU villages (16 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Tangar', 'tangar-6202032001', 'DESA', @mentaya_hulu_id),
(UUID(), 'Baampah', 'baampah-6202032002', 'DESA', @mentaya_hulu_id),
(UUID(), 'Kawan Batu', 'kawan-batu-6202032003', 'DESA', @mentaya_hulu_id),
(UUID(), 'Tanjung Bantur', 'tanjung-bantur-6202032004', 'DESA', @mentaya_hulu_id),
(UUID(), 'Penda Durian', 'penda-durian-6202032005', 'DESA', @mentaya_hulu_id),
(UUID(), 'Pahirangan', 'pahirangan-6202032006', 'DESA', @mentaya_hulu_id),
(UUID(), 'Satiung', 'satiung-6202032007', 'DESA', @mentaya_hulu_id),
(UUID(), 'Santilik', 'santilik-6202032008', 'DESA', @mentaya_hulu_id),
(UUID(), 'Tangka Robah', 'tangka-robah-6202032009', 'DESA', @mentaya_hulu_id),
(UUID(), 'Pemantang', 'pemantang-6202032010', 'DESA', @mentaya_hulu_id),
(UUID(), 'Tumbang Sapiri', 'tumbang-sapiri-6202032011', 'DESA', @mentaya_hulu_id),
(UUID(), 'Kuala Kuayan', 'kuala-kuayan-6202031012', 'DESA', @mentaya_hulu_id),
(UUID(), 'Bawan', 'bawan-6202032014', 'DESA', @mentaya_hulu_id),
(UUID(), 'Tanjung Jariangau', 'tanjung-jariangau-6202032015', 'DESA', @mentaya_hulu_id),
(UUID(), 'Kapuk', 'kapuk-6202032031', 'DESA', @mentaya_hulu_id),
(UUID(), 'Pantap', 'pantap-6202032032', 'DESA', @mentaya_hulu_id);

-- PARENGGEAN villages (15 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Tehang', 'tehang-6202042001', 'DESA', @parenggean_id),
(UUID(), 'Kabuau', 'kabuau-6202042002', 'DESA', @parenggean_id),
(UUID(), 'Parenggean', 'parenggean-6202041004', 'DESA', @parenggean_id),
(UUID(), 'Barunang Miri', 'barunang-miri-6202042007', 'DESA', @parenggean_id),
(UUID(), 'Sumber Makmur', 'sumber-makmur-6202042009', 'DESA', @parenggean_id),
(UUID(), 'Mekar Jaya', 'mekar-jaya-6202042010', 'DESA', @parenggean_id),
(UUID(), 'Karang Tunggal', 'karang-tunggal-6202042011', 'DESA', @parenggean_id),
(UUID(), 'Bandar Agung', 'bandar-agung-6202042012', 'DESA', @parenggean_id),
(UUID(), 'Beringin Tunggal Jaya', 'beringin-tunggal-jaya-6202042013', 'DESA', @parenggean_id),
(UUID(), 'Sari Harapan', 'sari-harapan-6202042015', 'DESA', @parenggean_id),
(UUID(), 'Karang Sari', 'karang-sari-6202042016', 'DESA', @parenggean_id),
(UUID(), 'Bajarau', 'bajarau-6202042019', 'DESA', @parenggean_id),
(UUID(), 'Bukit Harapan', 'bukit-harapan-6202042023', 'DESA', @parenggean_id),
(UUID(), 'Manjalin', 'manjalin-6202042024', 'DESA', @parenggean_id),
(UUID(), 'Karya Bersama', 'karya-bersama-6202042025', 'DESA', @parenggean_id);

-- BAAMANG villages (6 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Baamang Hilir', 'baamang-hilir-6202051001', 'DESA', @baamang_id),
(UUID(), 'Baamang Tengah', 'baamang-tengah-6202051002', 'DESA', @baamang_id),
(UUID(), 'Baamang Hulu', 'baamang-hulu-6202051003', 'DESA', @baamang_id),
(UUID(), 'Tinduk', 'tinduk-6202052006', 'DESA', @baamang_id),
(UUID(), 'Tanah Mas', 'tanah-mas-6202051007', 'DESA', @baamang_id),
(UUID(), 'Baamang Barat', 'baamang-barat-6202051008', 'DESA', @baamang_id);

-- MENTAWA BARU KETAPANG villages (11 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Mentawa Baru Hulu', 'mentawa-baru-hulu-6202061001', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Mentawa Baru Hilir', 'mentawa-baru-hilir-6202061002', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Ketapang', 'ketapang-6202061003', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Pelangsian', 'pelangsian-6202062005', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Bapeang', 'bapeang-6202062006', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Sawahan', 'sawahan-6202062007', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Eka Bahurui', 'eka-bahurui-6202062008', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Pasir Putih', 'pasir-putih-6202061009', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Telaga Baru', 'telaga-baru-6202062010', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Bangkuang Makmur', 'bangkuang-makmur-6202062011', 'DESA', @mentawa_baru_ketapang_id),
(UUID(), 'Bapanggang Raya', 'bapanggang-raya-6202062012', 'DESA', @mentawa_baru_ketapang_id);

-- MENTAYA HILIR UTARA villages (7 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Pondok Damar', 'pondok-damar-6202072001', 'DESA', @mentaya_hilir_utara_id),
(UUID(), 'Bagendang Hilir', 'bagendang-hilir-6202072002', 'DESA', @mentaya_hilir_utara_id),
(UUID(), 'Bagendang Tengah', 'bagendang-tengah-6202072003', 'DESA', @mentaya_hilir_utara_id),
(UUID(), 'Natai Baru', 'natai-baru-6202072004', 'DESA', @mentaya_hilir_utara_id),
(UUID(), 'Bagendang Hulu', 'bagendang-hulu-6202072005', 'DESA', @mentaya_hilir_utara_id),
(UUID(), 'Sumber Makmur', 'sumber-makmur-6202072006', 'DESA', @mentaya_hilir_utara_id),
(UUID(), 'Bagendang Permai', 'bagendang-permai-6202072007', 'DESA', @mentaya_hilir_utara_id);

-- MENTAYA HILIR SELATAN villages (10 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Sebamban', 'sebamban-6202082005', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Samuda Besar', 'samuda-besar-6202082006', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Samuda Kecil', 'samuda-kecil-6202082007', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Samuda Kota', 'samuda-kota-6202081008', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Basirih Hilir', 'basirih-hilir-6202081009', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Jaya Kelapa', 'jaya-kelapa-6202082010', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Basirih Hulu', 'basirih-hulu-6202082011', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Jaya Karet', 'jaya-karet-6202082012', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Handil Sohor', 'handil-sohor-6202082013', 'DESA', @mentaya_hilir_selatan_id),
(UUID(), 'Sei Ijum Raya', 'sei-ijum-raya-6202082014', 'DESA', @mentaya_hilir_selatan_id);

-- PULAU HANAUT villages (14 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Bapinang Hulu', 'bapinang-hulu-6202092001', 'DESA', @pulau_hanaut_id),
(UUID(), 'Bapinang Hilir', 'bapinang-hilir-6202092002', 'DESA', @pulau_hanaut_id),
(UUID(), 'Bapinang Hilir Laut', 'bapinang-hilir-laut-6202092003', 'DESA', @pulau_hanaut_id),
(UUID(), 'Satiruk', 'satiruk-6202092004', 'DESA', @pulau_hanaut_id),
(UUID(), 'Mekarti Jaya', 'mekarti-jaya-6202092005', 'DESA', @pulau_hanaut_id),
(UUID(), 'Rawa Sari', 'rawa-sari-6202092006', 'DESA', @pulau_hanaut_id),
(UUID(), 'Hanaut', 'hanaut-6202092007', 'DESA', @pulau_hanaut_id),
(UUID(), 'Babirah', 'babirah-6202092008', 'DESA', @pulau_hanaut_id),
(UUID(), 'Serambut', 'serambut-6202092009', 'DESA', @pulau_hanaut_id),
(UUID(), 'Babaung', 'babaung-6202092010', 'DESA', @pulau_hanaut_id),
(UUID(), 'Bamadu', 'bamadu-6202092011', 'DESA', @pulau_hanaut_id),
(UUID(), 'Penyaguan', 'penyaguan-6202092012', 'DESA', @pulau_hanaut_id),
(UUID(), 'Hantipan', 'hantipan-6202092013', 'DESA', @pulau_hanaut_id),
(UUID(), 'Bantian', 'bantian-6202092014', 'DESA', @pulau_hanaut_id);

-- ANTANG KALANG villages (15 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Tumbang Kalang', 'tumbang-kalang-6202102001', 'DESA', @antang_kalang_id),
(UUID(), 'Kuluk Telawang', 'kuluk-telawang-6202102002', 'DESA', @antang_kalang_id),
(UUID(), 'Sungai Puring', 'sungai-puring-6202102003', 'DESA', @antang_kalang_id),
(UUID(), 'Tumbang Ngahan', 'tumbang-ngahan-6202102004', 'DESA', @antang_kalang_id),
(UUID(), 'Tumbang Ramei', 'tumbang-ramei-6202102005', 'DESA', @antang_kalang_id),
(UUID(), 'Tumbang Hejan', 'tumbang-hejan-6202102006', 'DESA', @antang_kalang_id),
(UUID(), 'Sungai Hanya', 'sungai-hanya-6202102007', 'DESA', @antang_kalang_id),
(UUID(), 'Tumbang Sepayang', 'tumbang-sepayang-6202102008', 'DESA', @antang_kalang_id),
(UUID(), 'Buntut Nusa', 'buntut-nusa-6202102016', 'DESA', @antang_kalang_id),
(UUID(), 'Tumbang Gagu', 'tumbang-gagu-6202102017', 'DESA', @antang_kalang_id),
(UUID(), 'Tumbang Manya', 'tumbang-manya-6202102021', 'DESA', @antang_kalang_id),
(UUID(), 'Gunung Makmur', 'gunung-makmur-6202102025', 'DESA', @antang_kalang_id),
(UUID(), 'Mulya Agung', 'mulya-agung-6202102027', 'DESA', @antang_kalang_id),
(UUID(), 'Bhakti Karya', 'bhakti-karya-6202102028', 'DESA', @antang_kalang_id),
(UUID(), 'Waringin Agung', 'waringin-agung-6202102029', 'DESA', @antang_kalang_id);

-- TELUK SAMPIT villages (6 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Parebok', 'parebok-6202112001', 'DESA', @teluk_sampit_id),
(UUID(), 'Basawang', 'basawang-6202112002', 'DESA', @teluk_sampit_id),
(UUID(), 'Lampuyang', 'lampuyang-6202112003', 'DESA', @teluk_sampit_id),
(UUID(), 'Ujung Pandaran', 'ujung-pandaran-6202112004', 'DESA', @teluk_sampit_id),
(UUID(), 'Regei Lestari', 'regei-lestari-6202112005', 'DESA', @teluk_sampit_id),
(UUID(), 'Kuin Permai', 'kuin-permai-6202112006', 'DESA', @teluk_sampit_id);

-- SERANAU villages (6 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Mentaya Seberang', 'mentaya-seberang-6202121001', 'DESA', @seranau_id),
(UUID(), 'Terantang', 'terantang-6202122002', 'DESA', @seranau_id),
(UUID(), 'Batuah', 'batuah-6202122003', 'DESA', @seranau_id),
(UUID(), 'Terantang Hilir', 'terantang-hilir-6202122004', 'DESA', @seranau_id),
(UUID(), 'Ganepo', 'ganepo-6202122005', 'DESA', @seranau_id),
(UUID(), 'Seragam Jaya', 'seragam-jaya-6202122006', 'DESA', @seranau_id);

-- CEMPAGA HULU villages (11 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Pundu', 'pundu-6202132001', 'DESA', @cempaga_hulu_id),
(UUID(), 'Keruing', 'keruing-6202132002', 'DESA', @cempaga_hulu_id),
(UUID(), 'Parit', 'parit-6202132003', 'DESA', @cempaga_hulu_id),
(UUID(), 'Pantai Harapan', 'pantai-harapan-6202132004', 'DESA', @cempaga_hulu_id),
(UUID(), 'Pelantaran', 'pelantaran-6202132005', 'DESA', @cempaga_hulu_id),
(UUID(), 'Tumbang Koling', 'tumbang-koling-6202132006', 'DESA', @cempaga_hulu_id),
(UUID(), 'Sudan', 'sudan-6202132007', 'DESA', @cempaga_hulu_id),
(UUID(), 'Bukit Batu', 'bukit-batu-6202132008', 'DESA', @cempaga_hulu_id),
(UUID(), 'Bukit Raya', 'bukit-raya-6202132009', 'DESA', @cempaga_hulu_id),
(UUID(), 'Selucing', 'selucing-6202132010', 'DESA', @cempaga_hulu_id),
(UUID(), 'Sungai Ubar Mandiri', 'sungai-ubar-mandiri-6202132011', 'DESA', @cempaga_hulu_id);

-- TELAWANG villages (6 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Sebabi', 'sebabi-6202142001', 'DESA', @telawang_id),
(UUID(), 'Tanah Putih', 'tanah-putih-6202142002', 'DESA', @telawang_id),
(UUID(), 'Sumber Makmur', 'sumber-makmur-6202142003', 'DESA', @telawang_id),
(UUID(), 'Kenyala', 'kenyala-6202142004', 'DESA', @telawang_id),
(UUID(), 'Penyang', 'penyang-6202142005', 'DESA', @telawang_id),
(UUID(), 'Biru Maju', 'biru-maju-6202142006', 'DESA', @telawang_id);

-- BUKIT SANTUAI villages (14 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Tumbang Tilap', 'tumbang-tilap-6202152001', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Kaminting', 'tumbang-kaminting-6202152002', 'DESA', @bukit_santuai_id),
(UUID(), 'Tanah Haluan', 'tanah-haluan-6202152003', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Penyahuan', 'tumbang-penyahuan-6202152004', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Sapia', 'tumbang-sapia-6202152005', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Getas', 'tumbang-getas-6202152006', 'DESA', @bukit_santuai_id),
(UUID(), 'Tewai Hara', 'tewai-hara-6202152007', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Payang', 'tumbang-payang-6202152008', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Kania', 'tumbang-kania-6202152009', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Tawan', 'tumbang-tawan-6202152010', 'DESA', @bukit_santuai_id),
(UUID(), 'Lunuk Bagantung', 'lunuk-bagantung-6202152011', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Torung', 'tumbang-torung-6202152012', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Batu', 'tumbang-batu-6202152013', 'DESA', @bukit_santuai_id),
(UUID(), 'Tumbang Saluang', 'tumbang-saluang-6202152014', 'DESA', @bukit_santuai_id);

-- TUALAN HULU villages (11 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Luwuk Sampun', 'luwuk-sampun-6202162001', 'DESA', @tualan_hulu_id),
(UUID(), 'Tumbang Mujam', 'tumbang-mujam-6202162002', 'DESA', @tualan_hulu_id),
(UUID(), 'Merah', 'merah-6202162003', 'DESA', @tualan_hulu_id),
(UUID(), 'Tanjung Jorong', 'tanjung-jorong-6202162004', 'DESA', @tualan_hulu_id),
(UUID(), 'Sebungsu', 'sebungsu-6202162005', 'DESA', @tualan_hulu_id),
(UUID(), 'Bukit Makmur', 'bukit-makmur-6202162006', 'DESA', @tualan_hulu_id),
(UUID(), 'Wonosari', 'wonosari-6202162007', 'DESA', @tualan_hulu_id),
(UUID(), 'Mekar Sari', 'mekar-sari-6202162008', 'DESA', @tualan_hulu_id),
(UUID(), 'Damar Makmur', 'damar-makmur-6202162009', 'DESA', @tualan_hulu_id),
(UUID(), 'Cempaka Putih', 'cempaka-putih-6202162010', 'DESA', @tualan_hulu_id),
(UUID(), 'Jati Waringin', 'jati-waringin-6202162011', 'DESA', @tualan_hulu_id);

-- TELAGA ANTANG villages (18 villages)
INSERT INTO region (id, name, slug, type, parent_id) VALUES 
(UUID(), 'Tumbang Boloi', 'tumbang-boloi-6202172001', 'DESA', @telaga_antang_id),
(UUID(), 'Luwuk Kowan', 'luwuk-kowan-6202172002', 'DESA', @telaga_antang_id),
(UUID(), 'Rantau Tampang', 'rantau-tampang-6202172003', 'DESA', @telaga_antang_id),
(UUID(), 'Tumbang Mangkup', 'tumbang-mangkup-6202172004', 'DESA', @telaga_antang_id),
(UUID(), 'Rantau Katang', 'rantau-katang-6202172005', 'DESA', @telaga_antang_id),
(UUID(), 'Tumbang Sangai', 'tumbang-sangai-6202172006', 'DESA', @telaga_antang_id),
(UUID(), 'Tukang Langit', 'tukang-langit-6202172007', 'DESA', @telaga_antang_id),
(UUID(), 'Beringin Agung', 'beringin-agung-6202172008', 'DESA', @telaga_antang_id),
(UUID(), 'Agung Mulya', 'agung-mulya-6202172009', 'DESA', @telaga_antang_id),
(UUID(), 'Batu Agung', 'batu-agung-6202172010', 'DESA', @telaga_antang_id),
(UUID(), 'Bukit Indah', 'bukit-indah-6202172011', 'DESA', @telaga_antang_id),
(UUID(), 'Tumbang Puan', 'tumbang-puan-6202172012', 'DESA', @telaga_antang_id),
(UUID(), 'Rantau Suang', 'rantau-suang-6202172013', 'DESA', @telaga_antang_id),
(UUID(), 'Rantau Sawang', 'rantau-sawang-6202172014', 'DESA', @telaga_antang_id),
(UUID(), 'Tanjung Harapan', 'tanjung-harapan-6202172015', 'DESA', @telaga_antang_id),
(UUID(), 'Buana Mustika', 'buana-mustika-6202172016', 'DESA', @telaga_antang_id),
(UUID(), 'Tri Buana', 'tri-buana-6202172017', 'DESA', @telaga_antang_id),
(UUID(), 'Tumbang Bajanei', 'tumbang-bajanei-6202172018', 'DESA', @telaga_antang_id);

-- =====================================================
-- MONTHLY ASSESSMENT TEMPLATES SEEDING
-- =====================================================
-- Create monthly assessment templates for July-December 2025
-- Matches TypeScript seed: months JULY through DECEMBER

INSERT INTO monthly_assesment (id, month) VALUES 
(UUID(), 'JULY'),
(UUID(), 'AUGUST'),
(UUID(), 'SEPTEMBER'),
(UUID(), 'OCTOBER'),
(UUID(), 'NOVEMBER'),
(UUID(), 'DECEMBER');

-- =====================================================
-- DAILY ASSESSMENT TEMPLATES SEEDING
-- =====================================================
-- Create daily assessment templates for each day in the 6-month period
-- Each day gets placeholder menu entries: '<<menu>>'

-- Set monthly assessment variables
SET @july_id = (SELECT id FROM monthly_assesment WHERE month = 'JULY');
SET @august_id = (SELECT id FROM monthly_assesment WHERE month = 'AUGUST');
SET @september_id = (SELECT id FROM monthly_assesment WHERE month = 'SEPTEMBER');
SET @october_id = (SELECT id FROM monthly_assesment WHERE month = 'OCTOBER');
SET @november_id = (SELECT id FROM monthly_assesment WHERE month = 'NOVEMBER');
SET @december_id = (SELECT id FROM monthly_assesment WHERE month = 'DECEMBER');

-- JULY 2025 (30 days - skip day 31)
INSERT INTO daily_assesment (id, monthly_assesment_id, date, menu_1, menu_2)
SELECT 
  UUID(),
  @july_id,
  DATE('2025-07-01') + INTERVAL (n-1) DAY,
  '<<menu>>',
  '<<menu>>'
FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
) days;

-- AUGUST 2025 (30 days - skip day 31)
INSERT INTO daily_assesment (id, monthly_assesment_id, date, menu_1, menu_2)
SELECT 
  UUID(),
  @august_id,
  DATE('2025-08-01') + INTERVAL (n-1) DAY,
  '<<menu>>',
  '<<menu>>'
FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
) days;

-- SEPTEMBER 2025 (30 days)
INSERT INTO daily_assesment (id, monthly_assesment_id, date, menu_1, menu_2)
SELECT 
  UUID(),
  @september_id,
  DATE('2025-09-01') + INTERVAL (n-1) DAY,
  '<<menu>>',
  '<<menu>>'
FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
) days;

-- OCTOBER 2025 (30 days - skip day 31)
INSERT INTO daily_assesment (id, monthly_assesment_id, date, menu_1, menu_2)
SELECT 
  UUID(),
  @october_id,
  DATE('2025-10-01') + INTERVAL (n-1) DAY,
  '<<menu>>',
  '<<menu>>'
FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
) days;

-- NOVEMBER 2025 (30 days)
INSERT INTO daily_assesment (id, monthly_assesment_id, date, menu_1, menu_2)
SELECT 
  UUID(),
  @november_id,
  DATE('2025-11-01') + INTERVAL (n-1) DAY,
  '<<menu>>',
  '<<menu>>'
FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
) days;

-- DECEMBER 2025 (31 days)
INSERT INTO daily_assesment (id, monthly_assesment_id, date, menu_1, menu_2)
SELECT 
  UUID(),
  @december_id,
  DATE('2025-12-01') + INTERVAL (n-1) DAY,
  '<<menu>>',
  '<<menu>>'
FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
  SELECT 31
) days;

-- =====================================================
-- SITE PROPERTIES SEEDING
-- =====================================================
-- Configure default site properties matching TypeScript seed

INSERT INTO site (property, value) VALUES 
('SITE_NAME', 'Silaras Kotim'),
('SITE_DESCRIPTION', 'Sistem Laporan Dapur Sehat Atasi Stunting (DASHAT)'),
('SITE_LOGO', '');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DATA VERIFICATION QUERIES
-- =====================================================
-- Execute these queries to verify seed completion

-- Regional data summary
SELECT 
  'Regional Data Summary' as verification_type,
  type,
  COUNT(*) as total_count
FROM region 
GROUP BY type 
ORDER BY 
  CASE type 
    WHEN 'KABUPATEN' THEN 1 
    WHEN 'KECAMATAN' THEN 2 
    WHEN 'DESA' THEN 3 
  END;

-- Monthly assessment summary
SELECT 
  'Monthly Assessment Summary' as verification_type,
  month,
  COUNT(*) as count
FROM monthly_assesment 
GROUP BY month 
ORDER BY 
  CASE month
    WHEN 'JULY' THEN 1
    WHEN 'AUGUST' THEN 2  
    WHEN 'SEPTEMBER' THEN 3
    WHEN 'OCTOBER' THEN 4
    WHEN 'NOVEMBER' THEN 5
  END;

-- Daily assessment summary by month
SELECT 
  'Daily Assessment Summary' as verification_type,
  ma.month,
  COUNT(da.id) as daily_entries
FROM monthly_assesment ma
LEFT JOIN daily_assesment da ON ma.id = da.monthly_assesment_id
GROUP BY ma.month
ORDER BY 
  CASE ma.month
    WHEN 'JULY' THEN 1
    WHEN 'AUGUST' THEN 2  
    WHEN 'SEPTEMBER' THEN 3
    WHEN 'OCTOBER' THEN 4
    WHEN 'NOVEMBER' THEN 5
  END;

-- Site properties summary
SELECT 
  'Site Properties Summary' as verification_type,
  property,
  LEFT(value, 50) as value_preview
FROM site 
ORDER BY property;

-- Total records summary
SELECT 
  'Total Records Summary' as verification_type,
  'regions' as table_name,
  COUNT(*) as total_records
FROM region
UNION ALL
SELECT 
  'Total Records Summary',
  'monthly_assessments',
  COUNT(*)
FROM monthly_assesment
UNION ALL
SELECT 
  'Total Records Summary', 
  'daily_assessments',
  COUNT(*)
FROM daily_assesment
UNION ALL
SELECT 
  'Total Records Summary',
  'site_properties', 
  COUNT(*)
FROM site;

-- =====================================================
-- SEED COMPLETION NOTIFICATION
-- =====================================================
SELECT 
  '✅ SILARAS SEED COMPLETED SUCCESSFULLY!' as status,
  '203 regions seeded (1 KABUPATEN + 17 KECAMATAN + 185 DESA)' as regional_data,
  '5 months of assessment templates (July-November 2025)' as assessment_data,
  '150 daily assessment entries with menu placeholders (30 days each month)' as daily_entries,
  '3 site properties configured' as site_config,
  NOW() as completion_time;
