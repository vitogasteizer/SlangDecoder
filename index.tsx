import React, { useState, useCallback, useRef, useMemo, createContext, useContext, useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- From types.ts ---
enum CodeCategory {
  DANGEROUS = 'dangerous',
  PREDATOR = 'predator',
  HARMLESS = 'harmless'
}

interface CodeDefinition {
  id: number;
  code: string;
  meaningKey: string;
  category: CodeCategory;
}

interface Code extends CodeDefinition {
  meaning: string;
}

// --- From data/codes.ts ---
const CODES_MASTER: CodeDefinition[] = [
  // Dangerous Codes
  { id: 1, code: '53X', meaningKey: 'code_1_meaning', category: CodeCategory.DANGEROUS },
  { id: 2, code: 'KMS', meaningKey: 'code_2_meaning', category: CodeCategory.DANGEROUS },
  { id: 3, code: 'LH6', meaningKey: 'code_3_meaning', category: CodeCategory.DANGEROUS },
  { id: 4, code: 'MOS', meaningKey: 'code_4_meaning', category: CodeCategory.DANGEROUS },
  { id: 5, code: 'DOS', meaningKey: 'code_5_meaning', category: CodeCategory.DANGEROUS },
  { id: 6, code: 'POS', meaningKey: 'code_6_meaning', category: CodeCategory.DANGEROUS },
  { id: 7, code: 'CD9', meaningKey: 'code_7_meaning', category: CodeCategory.DANGEROUS },
  { id: 8, code: 'LMIRL', meaningKey: 'code_8_meaning', category: CodeCategory.DANGEROUS },
  { id: 9, code: 'CU46', meaningKey: 'code_9_meaning', category: CodeCategory.DANGEROUS },
  { id: 10, code: '99', meaningKey: 'code_10_meaning', category: CodeCategory.DANGEROUS },
  { id: 11, code: '505', meaningKey: 'code_11_meaning', category: CodeCategory.DANGEROUS },
  { id: 12, code: '11:11', meaningKey: 'code_12_meaning', category: CodeCategory.DANGEROUS },
  { id: 13, code: '273', meaningKey: 'code_13_meaning', category: CodeCategory.DANGEROUS },
  { id: 14, code: '171', meaningKey: 'code_14_meaning', category: CodeCategory.DANGEROUS },
  { id: 15, code: '363', meaningKey: 'code_15_meaning', category: CodeCategory.DANGEROUS },
  { id: 16, code: '909', meaningKey: 'code_16_meaning', category: CodeCategory.DANGEROUS },
  { id: 17, code: '770', meaningKey: 'code_17_meaning', category: CodeCategory.DANGEROUS },
  { id: 18, code: '297', meaningKey: 'code_18_meaning', category: CodeCategory.DANGEROUS },
  { id: 19, code: '028', meaningKey: 'code_19_meaning', category: CodeCategory.DANGEROUS },
  { id: 20, code: '988', meaningKey: 'code_20_meaning', category: CodeCategory.DANGEROUS },
  { id: 21, code: '29', meaningKey: 'code_21_meaning', category: CodeCategory.DANGEROUS },
  { id: 22, code: '1423', meaningKey: 'code_22_meaning', category: CodeCategory.DANGEROUS },
  { id: 23, code: '❄️🎱', meaningKey: 'code_23_meaning', category: CodeCategory.DANGEROUS },
  { id: 24, code: '💜💎', meaningKey: 'code_24_meaning', category: CodeCategory.DANGEROUS },
  { id: 25, code: '💙💎', meaningKey: 'code_25_meaning', category: CodeCategory.DANGEROUS },
  { id: 26, code: '🍄', meaningKey: 'code_26_meaning', category: CodeCategory.DANGEROUS },
  { id: 27, code: '🍀🎄🔥', meaningKey: 'code_27_meaning', category: CodeCategory.DANGEROUS },

  // Predator Codes
  { id: 28, code: 'Cheese pizza', meaningKey: 'code_28_meaning', category: CodeCategory.PREDATOR },
  { id: 29, code: 'Touch the ceiling', meaningKey: 'code_29_meaning', category: CodeCategory.PREDATOR },
  { id: 30, code: 'Nip Nops', meaningKey: 'code_30_meaning', category: CodeCategory.PREDATOR },
  { id: 31, code: 'Blue / Orange Youtube', meaningKey: 'code_31_meaning', category: CodeCategory.PREDATOR },
  { id: 32, code: '🔼', meaningKey: 'code_32_meaning', category: CodeCategory.PREDATOR },
  { id: 33, code: '💗', meaningKey: 'code_33_meaning', category: CodeCategory.PREDATOR },
  { id: 34, code: '🦋', meaningKey: 'code_34_meaning', category: CodeCategory.PREDATOR },

  // New Dangerous Codes
  { id: 35, code: 'Big back', meaningKey: 'code_35_meaning', category: CodeCategory.DANGEROUS },
  { id: 36, code: 'Body count', meaningKey: 'code_36_meaning', category: CodeCategory.DANGEROUS },
  { id: 37, code: 'Crossfaded', meaningKey: 'code_37_meaning', category: CodeCategory.DANGEROUS },
  { id: 38, code: 'Dox', meaningKey: 'code_38_meaning', category: CodeCategory.DANGEROUS },
  { id: 39, code: 'DTF', meaningKey: 'code_39_meaning', category: CodeCategory.DANGEROUS },
  { id: 40, code: 'FBOI', meaningKey: 'code_40_meaning', category: CodeCategory.DANGEROUS },
  { id: 41, code: 'Faded', meaningKey: 'code_41_meaning', category: CodeCategory.DANGEROUS },
  { id: 42, code: 'Flavored air', meaningKey: 'code_42_meaning', category: CodeCategory.DANGEROUS },
  { id: 43, code: 'FML', meaningKey: 'code_43_meaning', category: CodeCategory.DANGEROUS },
  { id: 44, code: 'Fugly', meaningKey: 'code_44_meaning', category: CodeCategory.DANGEROUS },
  { id: 45, code: 'FWB', meaningKey: 'code_45_meaning', category: CodeCategory.DANGEROUS },
  { id: 46, code: 'Hammered', meaningKey: 'code_46_meaning', category: CodeCategory.DANGEROUS },
  { id: 47, code: 'Juul', meaningKey: 'code_47_meaning', category: CodeCategory.DANGEROUS },
  { id: 48, code: 'Krunk', meaningKey: 'code_48_meaning', category: CodeCategory.DANGEROUS },
  { id: 49, code: 'KYS', meaningKey: 'code_49_meaning', category: CodeCategory.DANGEROUS },
  { id: 50, code: 'Plug', meaningKey: 'code_50_meaning', category: CodeCategory.DANGEROUS },
  { id: 51, code: 'Ran through', meaningKey: 'code_51_meaning', category: CodeCategory.DANGEROUS },
  { id: 52, code: 'Smash', meaningKey: 'code_52_meaning', category: CodeCategory.DANGEROUS },
  { id: 53, code: 'Smut', meaningKey: 'code_53_meaning', category: CodeCategory.DANGEROUS },
  { id: 54, code: 'Sparks', meaningKey: 'code_54_meaning', category: CodeCategory.DANGEROUS },
  { id: 55, code: 'Thot', meaningKey: 'code_55_meaning', category: CodeCategory.DANGEROUS },
  { id: 56, code: 'Thirst Trap', meaningKey: 'code_56_meaning', category: CodeCategory.DANGEROUS },
  { id: 57, code: 'Trap phone', meaningKey: 'code_57_meaning', category: CodeCategory.DANGEROUS },
  { id: 58, code: 'Xan', meaningKey: 'code_58_meaning', category: CodeCategory.DANGEROUS },

  // Harmless Codes
  { id: 59, code: 'Addy', meaningKey: 'code_59_meaning', category: CodeCategory.HARMLESS },
  { id: 60, code: 'AF', meaningKey: 'code_60_meaning', category: CodeCategory.HARMLESS },
  { id: 61, code: 'Amirite', meaningKey: 'code_61_meaning', category: CodeCategory.HARMLESS },
  { id: 62, code: 'Amped', meaningKey: 'code_62_meaning', category: CodeCategory.HARMLESS },
  { id: 63, code: 'And I oop', meaningKey: 'code_63_meaning', category: CodeCategory.HARMLESS },
  { id: 64, code: 'ASL', meaningKey: 'code_64_meaning', category: CodeCategory.HARMLESS },
  { id: 65, code: 'Ate and left no crumbs', meaningKey: 'code_65_meaning', category: CodeCategory.HARMLESS },
  { id: 66, code: 'Aura', meaningKey: 'code_66_meaning', category: CodeCategory.HARMLESS },
  { id: 67, code: 'Bae', meaningKey: 'code_67_meaning', category: CodeCategory.HARMLESS },
  { id: 68, code: 'Bandwagon', meaningKey: 'code_68_meaning', category: CodeCategory.HARMLESS },
  { id: 69, code: 'Basic', meaningKey: 'code_69_meaning', category: CodeCategory.HARMLESS },
  { id: 70, code: 'BBG', meaningKey: 'code_70_meaning', category: CodeCategory.HARMLESS },
  { id: 71, code: 'BDE', meaningKey: 'code_71_meaning', category: CodeCategory.HARMLESS },
  { id: 72, code: 'Bed rot', meaningKey: 'code_72_meaning', category: CodeCategory.HARMLESS },
  { id: 73, code: 'Beige flag', meaningKey: 'code_73_meaning', category: CodeCategory.HARMLESS },
  { id: 74, code: 'Bet', meaningKey: 'code_74_meaning', category: CodeCategory.HARMLESS },
  { id: 75, code: 'Bih', meaningKey: 'code_75_meaning', category: CodeCategory.HARMLESS },
  { id: 76, code: 'Boo', meaningKey: 'code_76_meaning', category: CodeCategory.HARMLESS },
  { id: 77, code: 'Boo’d up', meaningKey: 'code_77_meaning', category: CodeCategory.HARMLESS },
  { id: 78, code: 'Boomer/Okay Boomer', meaningKey: 'code_78_meaning', category: CodeCategory.HARMLESS },
  { id: 79, code: 'Boujee', meaningKey: 'code_79_meaning', category: CodeCategory.HARMLESS },
  { id: 80, code: 'Brat', meaningKey: 'code_80_meaning', category: CodeCategory.HARMLESS },
  { id: 81, code: 'Bussin’', meaningKey: 'code_81_meaning', category: CodeCategory.HARMLESS },
  { id: 82, code: 'Buttah', meaningKey: 'code_82_meaning', category: CodeCategory.HARMLESS },
  { id: 83, code: 'Cake', meaningKey: 'code_83_meaning', category: CodeCategory.HARMLESS },
  { id: 84, code: 'Cap', meaningKey: 'code_84_meaning', category: CodeCategory.HARMLESS },
  { id: 85, code: 'Cash', meaningKey: 'code_85_meaning', category: CodeCategory.HARMLESS },
  { id: 86, code: 'Catch feels', meaningKey: 'code_86_meaning', category: CodeCategory.HARMLESS },
  { id: 87, code: 'Catfish', meaningKey: 'code_87_meaning', category: CodeCategory.HARMLESS },
  { id: 88, code: 'Caught in 4k', meaningKey: 'code_88_meaning', category: CodeCategory.HARMLESS },
  { id: 89, code: 'Chad', meaningKey: 'code_89_meaning', category: CodeCategory.HARMLESS },
  { id: 90, code: 'Chat', meaningKey: 'code_90_meaning', category: CodeCategory.HARMLESS },
  { id: 91, code: 'Cheugy', meaningKey: 'code_91_meaning', category: CodeCategory.HARMLESS },
  { id: 92, code: 'Clapback', meaningKey: 'code_92_meaning', category: CodeCategory.HARMLESS },
  { id: 93, code: 'Cooked', meaningKey: 'code_93_meaning', category: CodeCategory.HARMLESS },
  { id: 94, code: 'Crash out', meaningKey: 'code_94_meaning', category: CodeCategory.HARMLESS },
  { id: 95, code: 'Cray cray', meaningKey: 'code_95_meaning', category: CodeCategory.HARMLESS },
  { id: 96, code: 'Cringe', meaningKey: 'code_96_meaning', category: CodeCategory.HARMLESS },
  { id: 97, code: 'Curve', meaningKey: 'code_97_meaning', category: CodeCategory.HARMLESS },
  { id: 98, code: 'Dank', meaningKey: 'code_98_meaning', category: CodeCategory.HARMLESS },
  { id: 99, code: 'Dap', meaningKey: 'code_99_meaning', category: CodeCategory.HARMLESS },
  { id: 100, code: 'Dayroom', meaningKey: 'code_100_meaning', category: CodeCategory.HARMLESS },
  { id: 101, code: 'Dead/Dying/Ded', meaningKey: 'code_101_meaning', category: CodeCategory.HARMLESS },
  { id: 102, code: 'Delulu', meaningKey: 'code_102_meaning', category: CodeCategory.HARMLESS },
  { id: 103, code: 'Dip', meaningKey: 'code_103_meaning', category: CodeCategory.HARMLESS },
  { id: 104, code: 'DL', meaningKey: 'code_104_meaning', category: CodeCategory.HARMLESS },
  { id: 105, code: 'Dope', meaningKey: 'code_105_meaning', category: CodeCategory.HARMLESS },
  { id: 106, code: 'Drag', meaningKey: 'code_106_meaning', category: CodeCategory.HARMLESS },
  { id: 107, code: 'Drip', meaningKey: 'code_107_meaning', category: CodeCategory.HARMLESS },
  { id: 108, code: 'Dub', meaningKey: 'code_108_meaning', category: CodeCategory.HARMLESS },
  { id: 109, code: 'Egirl/Eboy', meaningKey: 'code_109_meaning', category: CodeCategory.HARMLESS },
  { id: 110, code: 'Extra', meaningKey: 'code_110_meaning', category: CodeCategory.HARMLESS },
  { id: 111, code: 'Facts', meaningKey: 'code_111_meaning', category: CodeCategory.HARMLESS },
  { id: 112, code: 'Fan service', meaningKey: 'code_112_meaning', category: CodeCategory.HARMLESS },
  { id: 113, code: 'FFA', meaningKey: 'code_113_meaning', category: CodeCategory.HARMLESS },
  { id: 114, code: 'Finna', meaningKey: 'code_114_meaning', category: CodeCategory.HARMLESS },
  { id: 115, code: 'Finsta', meaningKey: 'code_115_meaning', category: CodeCategory.HARMLESS },
  { id: 116, code: 'Fire', meaningKey: 'code_116_meaning', category: CodeCategory.HARMLESS },
  { id: 117, code: 'Fit', meaningKey: 'code_117_meaning', category: CodeCategory.HARMLESS },
  { id: 118, code: 'Flex', meaningKey: 'code_118_meaning', category: CodeCategory.HARMLESS },
  { id: 119, code: 'FR', meaningKey: 'code_119_meaning', category: CodeCategory.HARMLESS },
  { id: 120, code: 'FRFR', meaningKey: 'code_120_meaning', category: CodeCategory.HARMLESS },
  { id: 121, code: 'FTW', meaningKey: 'code_121_meaning', category: CodeCategory.HARMLESS },
  { id: 122, code: 'Fuhuhluhtoogan', meaningKey: 'code_122_meaning', category: CodeCategory.HARMLESS },
  { id: 123, code: 'Furry', meaningKey: 'code_123_meaning', category: CodeCategory.HARMLESS },
  { id: 124, code: 'FW', meaningKey: 'code_124_meaning', category: CodeCategory.HARMLESS },
  { id: 125, code: 'FYP', meaningKey: 'code_125_meaning', category: CodeCategory.HARMLESS },
  { id: 126, code: 'G', meaningKey: 'code_126_meaning', category: CodeCategory.HARMLESS },
  { id: 127, code: 'Gassing', meaningKey: 'code_127_meaning', category: CodeCategory.HARMLESS },
  { id: 128, code: 'GG', meaningKey: 'code_128_meaning', category: CodeCategory.HARMLESS },
  { id: 129, code: 'Ghost', meaningKey: 'code_129_meaning', category: CodeCategory.HARMLESS },
  { id: 130, code: 'Girl math', meaningKey: 'code_130_meaning', category: CodeCategory.HARMLESS },
  { id: 131, code: 'Girl dinner', meaningKey: 'code_131_meaning', category: CodeCategory.HARMLESS },
  { id: 132, code: 'Gigachad', meaningKey: 'code_132_meaning', category: CodeCategory.HARMLESS },
  { id: 133, code: 'Giving me life', meaningKey: 'code_133_meaning', category: CodeCategory.HARMLESS },
  { id: 134, code: 'Glow-up', meaningKey: 'code_134_meaning', category: CodeCategory.HARMLESS },
  { id: 135, code: 'GOAT', meaningKey: 'code_135_meaning', category: CodeCategory.HARMLESS },
  { id: 136, code: 'Granola', meaningKey: 'code_136_meaning', category: CodeCategory.HARMLESS },
  { id: 137, code: 'Guap', meaningKey: 'code_137_meaning', category: CodeCategory.HARMLESS },
  { id: 138, code: 'Gucci', meaningKey: 'code_138_meaning', category: CodeCategory.HARMLESS },
  { id: 139, code: 'Gyat', meaningKey: 'code_139_meaning', category: CodeCategory.HARMLESS },
  { id: 140, code: 'Heated', meaningKey: 'code_140_meaning', category: CodeCategory.HARMLESS },
  { id: 141, code: 'Heem', meaningKey: 'code_141_meaning', category: CodeCategory.HARMLESS },
  { id: 142, code: 'Hella Skrilla', meaningKey: 'code_142_meaning', category: CodeCategory.HARMLESS },
  { id: 143, code: 'Here for this', meaningKey: 'code_143_meaning', category: CodeCategory.HARMLESS },
  { id: 144, code: 'High key', meaningKey: 'code_144_meaning', category: CodeCategory.HARMLESS },
  { id: 145, code: 'Highlighter kid', meaningKey: 'code_145_meaning', category: CodeCategory.HARMLESS },
  { id: 146, code: 'Hits different', meaningKey: 'code_146_meaning', category: CodeCategory.HARMLESS },
  { id: 147, code: 'Hollywood', meaningKey: 'code_147_meaning', category: CodeCategory.HARMLESS },
  { id: 148, code: 'Hop off', meaningKey: 'code_148_meaning', category: CodeCategory.HARMLESS },
  { id: 149, code: 'Hot take', meaningKey: 'code_149_meaning', category: CodeCategory.HARMLESS },
  { id: 150, code: 'Hunty', meaningKey: 'code_150_meaning', category: CodeCategory.HARMLESS },
  { id: 151, code: 'Hype', meaningKey: 'code_151_meaning', category: CodeCategory.HARMLESS },
  { id: 152, code: 'Ick', meaningKey: 'code_152_meaning', category: CodeCategory.HARMLESS },
  { id: 153, code: 'ICYMI', meaningKey: 'code_153_meaning', category: CodeCategory.HARMLESS },
  { id: 154, code: 'IRL', meaningKey: 'code_154_meaning', category: CodeCategory.HARMLESS },
  { id: 155, code: 'ISO', meaningKey: 'code_155_meaning', category: CodeCategory.HARMLESS },
  { id: 156, code: 'IYKYK', meaningKey: 'code_156_meaning', category: CodeCategory.HARMLESS },
  { id: 157, code: 'Jittleyang', meaningKey: 'code_157_meaning', category: CodeCategory.HARMLESS },
  { id: 158, code: 'KDA', meaningKey: 'code_158_meaning', category: CodeCategory.HARMLESS },
  { id: 159, code: 'Keep it 100', meaningKey: 'code_159_meaning', category: CodeCategory.HARMLESS },
  { id: 160, code: 'L', meaningKey: 'code_160_meaning', category: CodeCategory.HARMLESS },
  { id: 161, code: 'Left on read', meaningKey: 'code_161_meaning', category: CodeCategory.HARMLESS },
  { id: 162, code: 'Let them cook', meaningKey: 'code_162_meaning', category: CodeCategory.HARMLESS },
  { id: 163, code: 'Let’s get this bread', meaningKey: 'code_163_meaning', category: CodeCategory.HARMLESS },
  { id: 164, code: 'Lewk', meaningKey: 'code_164_meaning', category: CodeCategory.HARMLESS },
  { id: 165, code: 'LFG', meaningKey: 'code_165_meaning', category: CodeCategory.HARMLESS },
  { id: 166, code: 'Lit', meaningKey: 'code_166_meaning', category: CodeCategory.HARMLESS },
  { id: 167, code: 'LMAO', meaningKey: 'code_167_meaning', category: CodeCategory.HARMLESS },
  { id: 168, code: 'LMS', meaningKey: 'code_168_meaning', category: CodeCategory.HARMLESS },
  { id: 169, code: 'LOL', meaningKey: 'code_169_meaning', category: CodeCategory.HARMLESS },
  { id: 170, code: 'Looksmaxxing', meaningKey: 'code_170_meaning', category: CodeCategory.HARMLESS },
  { id: 171, code: 'Low taper fade', meaningKey: 'code_171_meaning', category: CodeCategory.HARMLESS },
  { id: 172, code: 'Mad', meaningKey: 'code_172_meaning', category: CodeCategory.HARMLESS },
  { id: 173, code: 'Menty b', meaningKey: 'code_173_meaning', category: CodeCategory.HARMLESS },
  { id: 174, code: 'Mewing', meaningKey: 'code_174_meaning', category: CodeCategory.HARMLESS },
  { id: 175, code: 'Mid', meaningKey: 'code_175_meaning', category: CodeCategory.HARMLESS },
  { id: 176, code: 'Mogging', meaningKey: 'code_176_meaning', category: CodeCategory.HARMLESS },
  { id: 177, code: 'Munch', meaningKey: 'code_177_meaning', category: CodeCategory.HARMLESS },
  { id: 178, code: 'Netflix and chill', meaningKey: 'code_178_meaning', category: CodeCategory.HARMLESS },
  { id: 179, code: 'NGL', meaningKey: 'code_179_meaning', category: CodeCategory.HARMLESS },
  { id: 180, code: 'NSFW', meaningKey: 'code_180_meaning', category: CodeCategory.HARMLESS },
  { id: 181, code: 'OMG', meaningKey: 'code_181_meaning', category: CodeCategory.HARMLESS },
  { id: 182, code: 'OML', meaningKey: 'code_182_meaning', category: CodeCategory.HARMLESS },
  { id: 183, code: 'OMW', meaningKey: 'code_183_meaning', category: CodeCategory.HARMLESS },
  { id: 184, code: 'ONG', meaningKey: 'code_184_meaning', category: CodeCategory.HARMLESS },
  { id: 185, code: 'On fleek', meaningKey: 'code_185_meaning', category: CodeCategory.HARMLESS },
  { id: 186, code: 'On point', meaningKey: 'code_186_meaning', category: CodeCategory.HARMLESS },
  { id: 187, code: 'Only in Ohio', meaningKey: 'code_187_meaning', category: CodeCategory.HARMLESS },
  { id: 188, code: 'Ops', meaningKey: 'code_188_meaning', category: CodeCategory.HARMLESS },
  { id: 189, code: 'OTP', meaningKey: 'code_189_meaning', category: CodeCategory.HARMLESS },
  { id: 190, code: 'Periodt', meaningKey: 'code_190_meaning', category: CodeCategory.HARMLESS },
  { id: 191, code: 'PMOYS', meaningKey: 'code_191_meaning', category: CodeCategory.HARMLESS },
  { id: 192, code: 'Poggers', meaningKey: 'code_192_meaning', category: CodeCategory.HARMLESS },
  { id: 193, code: 'Preppy', meaningKey: 'code_193_meaning', category: CodeCategory.HARMLESS },
  { id: 194, code: 'Pressed', meaningKey: 'code_194_meaning', category: CodeCategory.HARMLESS },
  { id: 195, code: 'Pulling', meaningKey: 'code_195_meaning', category: CodeCategory.HARMLESS },
  { id: 196, code: 'Put on blast', meaningKey: 'code_196_meaning', category: CodeCategory.HARMLESS },
  { id: 197, code: 'Pwn', meaningKey: 'code_197_meaning', category: CodeCategory.HARMLESS },
  { id: 198, code: 'Rad', meaningKey: 'code_198_meaning', category: CodeCategory.HARMLESS },
  { id: 199, code: 'Ratchet', meaningKey: 'code_199_meaning', category: CodeCategory.HARMLESS },
  { id: 200, code: 'Read', meaningKey: 'code_200_meaning', category: CodeCategory.HARMLESS },
  { id: 201, code: 'Real', meaningKey: 'code_201_meaning', category: CodeCategory.HARMLESS },
  { id: 202, code: 'Receipts', meaningKey: 'code_202_meaning', category: CodeCategory.HARMLESS },
  { id: 203, code: 'Rent free', meaningKey: 'code_203_meaning', category: CodeCategory.HARMLESS },
  { id: 204, code: 'Rizz', meaningKey: 'code_204_meaning', category: CodeCategory.HARMLESS },
  { id: 205, code: 'ROTFLMAO', meaningKey: 'code_205_meaning', category: CodeCategory.HARMLESS },
  { id: 206, code: 'RN', meaningKey: 'code_206_meaning', category: CodeCategory.HARMLESS },
  { id: 207, code: 'RPG', meaningKey: 'code_207_meaning', category: CodeCategory.HARMLESS },
  { id: 208, code: 'Salty', meaningKey: 'code_208_meaning', category: CodeCategory.HARMLESS },
  { id: 209, code: 'Savage', meaningKey: 'code_209_meaning', category: CodeCategory.HARMLESS },
  { id: 210, code: 'Say less', meaningKey: 'code_210_meaning', category: CodeCategory.HARMLESS },
  { id: 211, code: 'Sending me', meaningKey: 'code_211_meaning', category: CodeCategory.HARMLESS },
  { id: 212, code: 'Shade', meaningKey: 'code_212_meaning', category: CodeCategory.HARMLESS },
  { id: 213, code: 'Ship', meaningKey: 'code_213_meaning', category: CodeCategory.HARMLESS },
  { id: 214, code: 'Shook', meaningKey: 'code_214_meaning', category: CodeCategory.HARMLESS },
  { id: 215, code: 'Shorty', meaningKey: 'code_215_meaning', category: CodeCategory.HARMLESS },
  { id: 216, code: 'Sick', meaningKey: 'code_216_meaning', category: CodeCategory.HARMLESS },
  { id: 217, code: 'Sigma', meaningKey: 'code_217_meaning', category: CodeCategory.HARMLESS },
  { id: 218, code: 'Simp', meaningKey: 'code_218_meaning', category: CodeCategory.HARMLESS },
  { id: 219, code: 'Skibidi Toilet', meaningKey: 'code_219_meaning', category: CodeCategory.HARMLESS },
  { id: 220, code: 'Slap', meaningKey: 'code_220_meaning', category: CodeCategory.HARMLESS },
  { id: 221, code: 'Slay', meaningKey: 'code_221_meaning', category: CodeCategory.HARMLESS },
  { id: 222, code: 'Slim thick/thicc', meaningKey: 'code_222_meaning', category: CodeCategory.HARMLESS },
  { id: 223, code: 'Small dick energy', meaningKey: 'code_223_meaning', category: CodeCategory.HARMLESS },
  { id: 224, code: 'SMH', meaningKey: 'code_224_meaning', category: CodeCategory.HARMLESS },
  { id: 225, code: 'Smol', meaningKey: 'code_225_meaning', category: CodeCategory.HARMLESS },
  { id: 226, code: 'Snack', meaningKey: 'code_226_meaning', category: CodeCategory.HARMLESS },
  { id: 227, code: 'Snatched', meaningKey: 'code_227_meaning', category: CodeCategory.HARMLESS },
  { id: 228, code: 'Sneaky link', meaningKey: 'code_228_meaning', category: CodeCategory.HARMLESS },
  { id: 229, code: 'SO', meaningKey: 'code_229_meaning', category: CodeCategory.HARMLESS },
  { id: 230, code: 'Stan', meaningKey: 'code_230_meaning', category: CodeCategory.HARMLESS },
  { id: 231, code: 'Stoked', meaningKey: 'code_231_meaning', category: CodeCategory.HARMLESS },
  { id: 232, code: 'Sus', meaningKey: 'code_232_meaning', category: CodeCategory.HARMLESS },
  { id: 233, code: 'Swerve', meaningKey: 'code_233_meaning', category: CodeCategory.HARMLESS },
  { id: 234, code: 'Swole', meaningKey: 'code_234_meaning', category: CodeCategory.HARMLESS },
  { id: 235, code: 'Swoop', meaningKey: 'code_235_meaning', category: CodeCategory.HARMLESS },
  { id: 236, code: 'Take a seat', meaningKey: 'code_236_meaning', category: CodeCategory.HARMLESS },
  { id: 237, code: 'Tea', meaningKey: 'code_237_meaning', category: CodeCategory.HARMLESS },
  { id: 238, code: 'TF', meaningKey: 'code_238_meaning', category: CodeCategory.HARMLESS },
  { id: 239, code: 'TFW', meaningKey: 'code_239_meaning', category: CodeCategory.HARMLESS },
  { id: 240, code: 'Totes', meaningKey: 'code_240_meaning', category: CodeCategory.HARMLESS },
  { id: 241, code: 'Touch grass', meaningKey: 'code_241_meaning', category: CodeCategory.HARMLESS },
  { id: 242, code: 'Twin', meaningKey: 'code_242_meaning', category: CodeCategory.HARMLESS },
  { id: 243, code: 'Twizzy', meaningKey: 'code_243_meaning', category: CodeCategory.HARMLESS },
  { id: 244, code: 'Uhh', meaningKey: 'code_244_meaning', category: CodeCategory.HARMLESS },
  { id: 245, code: 'Unc', meaningKey: 'code_245_meaning', category: CodeCategory.HARMLESS },
  { id: 246, code: 'Understood the assignment', meaningKey: 'code_246_meaning', category: CodeCategory.HARMLESS },
  { id: 247, code: 'Upper decky', meaningKey: 'code_247_meaning', category: CodeCategory.DANGEROUS },
  { id: 248, code: 'V', meaningKey: 'code_248_meaning', category: CodeCategory.HARMLESS },
  { id: 249, code: 'Vanilla', meaningKey: 'code_249_meaning', category: CodeCategory.HARMLESS },
  { id: 250, code: 'Vibe', meaningKey: 'code_250_meaning', category: CodeCategory.HARMLESS },
  { id: 251, code: 'VSCO girl', meaningKey: 'code_251_meaning', category: CodeCategory.HARMLESS },
  { id: 252, code: 'W', meaningKey: 'code_252_meaning', category: CodeCategory.HARMLESS },
  { id: 253, code: 'Wallflower', meaningKey: 'code_253_meaning', category: CodeCategory.HARMLESS },
  { id: 254, code: 'Weird flex but ok', meaningKey: 'code_254_meaning', category: CodeCategory.HARMLESS },
  { id: 255, code: 'Whip', meaningKey: 'code_255_meaning', category: CodeCategory.HARMLESS },
  { id: 256, code: 'Whole meal', meaningKey: 'code_256_meaning', category: CodeCategory.HARMLESS },
  { id: 257, code: 'Wig snatched', meaningKey: 'code_257_meaning', category: CodeCategory.HARMLESS },
  { id: 258, code: 'Woke', meaningKey: 'code_258_meaning', category: CodeCategory.HARMLESS },
  { id: 259, code: 'WYA', meaningKey: 'code_259_meaning', category: CodeCategory.HARMLESS },
  { id: 260, code: 'WYD', meaningKey: 'code_260_meaning', category: CodeCategory.HARMLESS },
  { id: 261, code: 'YAAS', meaningKey: 'code_261_meaning', category: CodeCategory.HARMLESS },
  { id: 262, code: 'Yeet', meaningKey: 'code_262_meaning', category: CodeCategory.HARMLESS },
  { id: 263, code: 'Zaddy', meaningKey: 'code_263_meaning', category: CodeCategory.HARMLESS },
  { id: 264, code: '6-7', meaningKey: 'code_264_meaning', category: CodeCategory.HARMLESS }
];

// --- From services/geminiService.ts ---
const prompts = {
  es: (code: Code) => `Explica el origen o la lógica para descifrar el siguiente código juvenil: "${code.code}".

El significado conocido es: "${code.meaning}".

Por ejemplo, si es un acrónimo (como 'BRB' por 'Be Right Back') o si los números representan el conteo de letras (como '143' por 'I Love You').

Tu explicación debe ser breve, clara y centrarse únicamente en CÓMO el código representa el significado. No agregues consejos para padres ni información de contexto adicional.

Responde en español.`,

  en: (code: Code) => `Explain the origin or logic for deciphering the following teen slang code: "${code.code}".

The known meaning is: "${code.meaning}".

For example, if it's an acronym (like 'BRB' for 'Be Right Back') or if the numbers represent letter counts (like '143' for 'I Love You').

Your explanation should be brief, clear, and focus solely on HOW the code represents the meaning. Do not add parental advice or extra context.

Respond in English.`,

  ka: (code: Code) => `ახსენი შემდეგი თინეიჯერული სლენგის კოდის წარმოშობა ან ლოგიკა: "${code.code}".

ცნობილი მნიშვნელობაა: "${code.meaning}".

მაგალითად, თუ ეს არის აკრონიმი (როგორიცაა 'BRB' - 'Be Right Back') ან თუ რიცხვები წარმოადგენს ასოების რაოდენობას (როგორიცაა '143' - 'I Love You').

შენი ახსნა უნდა იყოს მოკლე, გასაგები და ფოკუსირებული მხოლოდ იმაზე, თუ როგორ წარმოადგენს კოდი მის მნიშვნელობას. არ დაამატო რჩევები მშობლებისთვის ან დამატებითი კონტექსტი.

მიპასუხე ქართულად.`
};

const getExplanation = async (code: Code, lang: 'es' | 'en' | 'ka'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = prompts[lang](code);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching explanation from Gemini API:", error);
    let errorMessage = "Could not get a detailed explanation at this time. Please try again later.";
    if (lang === 'es') {
      errorMessage = "No se pudo obtener una explicación detallada en este momento. Por favor, inténtelo de nuevo más tarde.";
    } else if (lang === 'ka') {
      errorMessage = "ამჟამად დეტალური ახსნა-განმარტების მიღება ვერ ხერხდება. გთხოვთ, სცადოთ მოგვიანებით.";
    }
    return errorMessage;
  }
};

// --- From contexts/LanguageContext.tsx ---
type Language = 'es' | 'en' | 'ka';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  codes: Code[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>> | null>(null);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en' || browserLang === 'es' || browserLang === 'ka') {
      setLang(browserLang as Language);
    }

    const fetchTranslations = async () => {
      try {
        const [esRes, enRes, kaRes] = await Promise.all([
          fetch('./locales/es.json'),
          fetch('./locales/en.json'),
          fetch('./locales/ka.json'),
        ]);
        if (!esRes.ok || !enRes.ok || !kaRes.ok) {
          throw new Error('Failed to fetch translation files');
        }
        const esData = await esRes.json();
        const enData = await enRes.json();
        const kaData = await kaRes.json();
        setTranslations({ es: esData, en: enData, ka: kaData });
      } catch (error) {
        console.error("Failed to load translation files", error);
        // Fallback to empty objects to prevent app crash
        setTranslations({ es: {}, en: {}, ka: {} });
      }
    };
    fetchTranslations();
  }, []);
  
  const t = (key: string): string => {
    if (!translations) return key; // Return key if not loaded
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const codes: Code[] = useMemo(() => {
    if (!translations) return [];
    return CODES_MASTER.map(masterCode => ({
      ...masterCode,
      meaning: t(masterCode.meaningKey)
    }));
  }, [lang, translations, t]); // Added 't' to dependency array


  if (!translations) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const value = {
    lang,
    setLanguage: setLang,
    t,
    codes,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- View Type from App.tsx ---
type View = 'search' | 'library';

// --- Shared Category Styles ---
const categoryStyles: { [key in CodeCategory]: { bg: string; text: string; border: string } } = {
  [CodeCategory.DANGEROUS]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
  [CodeCategory.PREDATOR]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
  [CodeCategory.HARMLESS]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
};

const libraryCategoryStyles: { [key in CodeCategory]: { border: string; bg: string; text: string } } = {
  [CodeCategory.DANGEROUS]: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800' },
  [CodeCategory.PREDATOR]: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-800' },
  [CodeCategory.HARMLESS]: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' },
};

// --- From components/Header.tsx ---
interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, lang, setLanguage } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSetLanguage = (newLang: 'en' | 'es' | 'ka') => {
    setLanguage(newLang);
    setMenuOpen(false);
  };
  
  const handleSetView = (newView: View) => {
    setView(newView);
    setMenuOpen(false);
  }

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-indigo-600">Decoder</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button onClick={() => setView('search')} className={`${currentView === 'search' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} px-3 py-2 rounded-md text-sm font-medium`}>{t('search')}</button>
              <button onClick={() => setView('library')} className={`${currentView === 'library' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} px-3 py-2 rounded-md text-sm font-medium`}>{t('library')}</button>
               <div className="relative group">
                <button className="text-gray-600 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <span>{lang.toUpperCase()}</span>
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                 <div className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                  <div className="py-1">
                    <button onClick={() => handleSetLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English</button>
                    <button onClick={() => handleSetLanguage('es')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Español</button>
                    <button onClick={() => handleSetLanguage('ka')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">ქართული</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} type="button" className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden" id="mobile-menu" ref={menuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleSetView('search')} className={`${currentView === 'search' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} block px-3 py-2 rounded-md text-base font-medium w-full text-left`}>{t('search')}</button>
            <button onClick={() => handleSetView('library')} className={`${currentView === 'library' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} block px-3 py-2 rounded-md text-base font-medium w-full text-left`}>{t('library')}</button>
             <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-2 space-y-1">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('selectLanguage')}</h3>
                    <button onClick={() => handleSetLanguage('en')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200">English</button>
                    <button onClick={() => handleSetLanguage('es')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200">Español</button>
                    <button onClick={() => handleSetLanguage('ka')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200">ქართული</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// --- From components/Library.tsx ---
const Library: React.FC = () => {
  const { t, codes } = useLanguage();
  const categoryOrder = [CodeCategory.DANGEROUS, CodeCategory.PREDATOR, CodeCategory.HARMLESS];

  const groupedCodes = useMemo(() => {
    const groups: { [key in CodeCategory]?: Code[] } = {};
    for (const code of codes) {
      if (!groups[code.category]) {
        groups[code.category] = [];
      }
      groups[code.category]?.push(code);
    }
    // Sort codes within each category alphabetically
    for (const category in groups) {
      groups[category as CodeCategory]?.sort((a, b) => a.code.localeCompare(b.code));
    }
    return groups;
  }, [codes]);

  const handleScrollToCategory = (categoryKey: CodeCategory) => {
    const element = document.getElementById(categoryKey);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{t('libraryTitle')}</h1>
        <p className="mt-4 text-lg text-gray-600">{t('libraryDescription')}</p>
      </header>

      <nav className="sticky top-20 bg-white/90 backdrop-blur-sm z-10 shadow-sm rounded-full mb-8 py-2 px-2 border">
        <div className="flex justify-center items-center flex-wrap gap-2">
          {categoryOrder.map(categoryKey => (
            <button
              key={categoryKey}
              onClick={() => handleScrollToCategory(categoryKey)}
              className="px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              {t(categoryKey)}
            </button>
          ))}
        </div>
      </nav>

      <div className="space-y-8">
        {categoryOrder.map(categoryKey => {
          const codesForCategory = groupedCodes[categoryKey];
          if (!codesForCategory || codesForCategory.length === 0) return null;
          
          const styles = libraryCategoryStyles[categoryKey];

          return (
            <section key={categoryKey} id={categoryKey} className={`rounded-lg shadow-md border-t-4 ${styles.border} ${styles.bg} scroll-mt-32`}>
              <h2 className={`text-2xl font-bold p-4 ${styles.text} rounded-t-lg`}>
                {t(categoryKey)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
                {codesForCategory.map(code => (
                   <div key={code.id} className="p-4 bg-white flex justify-between items-start">
                     <div>
                       <p className="font-bold text-gray-800 text-lg">{code.code}</p>
                       <p className="text-gray-600">{code.meaning}</p>
                     </div>
                   </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

// --- From components/Search.tsx ---
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

interface ResultCardProps {
  code: Code;
  onSelect: (code: Code) => void;
  isActive: boolean;
  explanation: string | null;
  isLoading: boolean;
  categoryText: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ code, onSelect, isActive, explanation, isLoading, categoryText }) => {
  const styles = categoryStyles[code.category];

  return (
    <div
      className={`border-l-4 ${styles.border} ${styles.bg} p-4 rounded-r-lg shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-opacity-80`}
      onClick={() => onSelect(code)}
      role="button"
      aria-expanded={isActive}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{code.code}</h3>
          <p className="text-gray-600">{code.meaning}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}>{categoryText}</span>
        </div>
      </div>
      {isActive && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: explanation ? explanation.replace(/\n/g, '<br />') : '' }} />
          )}
        </div>
      )}
    </div>
  );
};

const Search: React.FC = () => {
  const { t, lang, codes } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCode, setActiveCode] = useState<Code | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [geminiResponses, setGeminiResponses] = useState<Record<string, string>>({});

  const geminiCache = useRef<Map<string, string>>(new Map());

  // Load cache from localStorage on initial render
  useState(() => {
    try {
      const cachedData = localStorage.getItem('geminiCache');
      if (cachedData) {
        geminiCache.current = new Map(JSON.parse(cachedData));
      }
    } catch (error) {
      console.error("Failed to parse Gemini cache from localStorage", error);
    }
  });

  const filteredCodes = useMemo(() => {
    if (searchTerm.trim() === '') {
      return [];
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return codes.filter(
      code =>
        code.code.toLowerCase().includes(lowerCaseSearchTerm) ||
        code.meaning.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, codes]);

  const handleSelectCode = useCallback(async (code: Code) => {
    if (activeCode?.id === code.id) {
      setActiveCode(null);
      return;
    }

    setActiveCode(code);
    
    const cacheKey = `${lang}:${code.id}`;
    const responseKey = `${code.id}`;

    if (geminiCache.current.has(cacheKey)) {
      setGeminiResponses(prev => ({ ...prev, [responseKey]: geminiCache.current.get(cacheKey)! }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [responseKey]: true }));
    try {
      const explanation = await getExplanation(code, lang);
      geminiCache.current.set(cacheKey, explanation);
      localStorage.setItem('geminiCache', JSON.stringify(Array.from(geminiCache.current.entries())));
      setGeminiResponses(prev => ({ ...prev, [responseKey]: explanation }));
    } catch (error) {
      console.error(error);
      setGeminiResponses(prev => ({ ...prev, [responseKey]: t('explanationError') }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [responseKey]: false }));
    }
  }, [activeCode, lang, t]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if(newSearchTerm.trim() === '') {
        setActiveCode(null);
    }
  }

  return (
    <>
      <header className="text-center mb-8">
        <div className="inline-block bg-indigo-600 text-white p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.789-2.75 9.565M12 11c0-3.517.99-6.789 2.75-9.565M12 11H3.344a1 1 0 00-1 1v1a1 1 0 001 1h.172M12 11h8.656a1 1 0 011 1v1a1 1 0 01-1 1h-.172M7.25 21.435a8.96 8.96 0 01-4.124-3.138 1 1 0 01.328-1.393l.002-.001.002-.001a1 1 0 011.393.328 6.96 6.96 0 003.202 2.457 1 1 0 01-.803 1.747zM16.75 2.565a8.96 8.96 0 014.124 3.138 1 1 0 01-.328 1.393l-.002.001-.002.001a1 1 0 01-1.393-.328 6.96 6.96 0 00-3.202-2.457 1 1 0 01.803-1.747z" /></svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{t('appTitle')}</h1>
        <p className="mt-4 text-lg text-gray-600">{t('appSubtitle')}</p>
      </header>

      <div className="relative mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('searchPlaceholder')}
          className="w-full p-4 pl-12 text-lg border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="space-y-4">
        {searchTerm.trim() !== '' && filteredCodes.length > 0 && filteredCodes.map(code => (
          <ResultCard
            key={code.id}
            code={code}
            onSelect={handleSelectCode}
            isActive={activeCode?.id === code.id}
            explanation={geminiResponses[code.id.toString()] || null}
            isLoading={loadingStates[code.id.toString()] || false}
            categoryText={t(code.category)}
          />
        ))}
        {searchTerm.trim() !== '' && filteredCodes.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="mt-4 text-gray-600 font-semibold">{t('noResults')} "{searchTerm}".</p>
            <p className="text-sm text-gray-500">{t('tryAnotherSearch')}</p>
          </div>
        )}
        {searchTerm.trim() === '' && (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l-4-4m0 0l4-4m-4 4h18" /></svg>
            <p className="mt-4 text-gray-600 font-semibold">{t('startTyping')}</p>
            <p className="text-sm text-gray-500">{t('resultsAppearHere')}</p>
          </div>
        )}
      </div>
    </>
  );
};

// --- From App.tsx ---
const App: React.FC = () => {
  const [view, setView] = useState<View>('search');
  const { t } = useLanguage();

  const renderView = () => {
    switch (view) {
      case 'search':
        return <Search />;
      case 'library':
        return <Library />;
      default:
        return <Search />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header currentView={view} setView={setView} />
      <main className="container mx-auto p-4 md:p-8 max-w-3xl">
        {renderView()}
      </main>
      <footer className="text-center mt-12 mb-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {t('footerText')}</p>
      </footer>
    </div>
  );
};

// --- Render logic from original index.tsx ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
