// Gói three.js và các thư viện phụ thành một file để các file js/*.js dùng được như script thường.
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';
window.THREE=THREE;
Object.assign(window,{OrbitControls,TransformControls,STLLoader,RoomEnvironment,unzipSync,strFromU8});
