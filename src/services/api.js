import { io } from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js"
// Define the base URL for the backend API
export const hostSocket = 'https://5kwnwfbb-5600.inc1.devtunnels.ms';
// export const hostSocket = 'http://guidelms.in:59001'
// Function to make general (non-secure) requests
export async function makeRequest(url, method, data = {}) {
const reqObj = {
    method,
    headers: {
    	"Content-Type": "application/json",
      	Accept: "application/json",
    },
    body: JSON.stringify(data),
  };
  // If it's a GET request, remove the body since it's not needed
  if (method.toLowerCase() === "get") delete reqObj.body;

  const response = await fetch(hostSocket + url, reqObj);
  // console.log(response.json());
  let obj = await response.json();
  if (!response.ok) throw new Error(obj.message || 'some unknown error');
  return obj;
}

// Function to make secure requests with token-based authentication
export async function makeSecureRequest(url, method, data = {}) {
  const token = getItemWithExpiry("token");  // Retrieve token from localStorage
  if (!token) throw new Error("Authentication required");  // Ensure there's a token
  
  const reqObj = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,  // Include the token in the header
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  // If it's a GET request, remove the body since it's not needed
  if (method.toLowerCase() === "get") delete reqObj.body;

  const response = await fetch(hostSocket + url, reqObj);
  // if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  // return await response.json();
  let obj = await response.json();
  if (!response.ok) throw new Error(obj.message || 'some unknown error');
  return obj;
}

// Function to fetch classrooms (using secure request)
export const fetchClassrooms = async () => {
  return await makeSecureRequest("/api/classrooms", "GET");  // Fetch classrooms data
};

// Function to fetch events (using secure request)
export const fetchEvents = async () => {
  return await makeSecureRequest("/api/events", "GET");  // Fetch events data
};

// createEvent.js
export async function createEvent(e) {
  e.preventDefault(); // Prevent the default form submission

  // Create a JSON object based on the schema
  const formData = new FormData(e.target, e.submitter);
  const eventJson = {
    mandatory: formData.get("mandatory") === "on",
    title: formData.get("title"),
    description: {
      objectives: formData.get("objectives").split("\n"), // Split by line for multiple objectives
      learning_outcomes: formData.get("learning_outcomes").split("\n"), // Split by line for multiple outcomes
    },
    start_time: new Date(formData.get("start_time")).toISOString(),
    end_time: new Date(formData.get("end_time")).toISOString(),
    location: {
      address: formData.get("address"),
      lat: parseFloat(formData.get("lat")) || null,
      long: parseFloat(formData.get("long")) || null,
    },
    speaker_ids: formData
      ?.get("speaker_ids")
      ?.split(",")
      .map((id) => id.trim()), // Split by comma for multiple IDs
  };

  try {
    const data = await makeSecureRequest('/api/events','POST',eventJson); 
    // const data = await response.json();
    console.log('Event created:', data);
    // Handle success (e.g., show a success message, redirect)
  } catch (error) {
    console.log(error.message);
  }
}


export function setItemWithExpiry(key, value, ttl) {
	const now = new Date();
	const item = {
		value: value, // The actual data
		expiry: now.getTime() + ttl // Expiry time in milliseconds
	};
	localStorage.setItem(key, JSON.stringify(item));
}

export function getItemWithExpiry(key) {
	try {
		const itemStr = localStorage.getItem(key);
		if (!itemStr) {
			return null; // Item does not exist
		}
		const item = JSON.parse(itemStr);

		const now = new Date();

		// Compare the expiry time with the current time
		if (now.getTime() > item.expiry) {
			localStorage.removeItem(key); // Remove the expired item
			return null; // Indicate the item has expired
		}
		return item.value; // Return the value if not expired
	} catch (error) {
		console.warn("error", error)
		return null;
	}
}


export function initSocket(
	{newMessageCallback, 
	connectionCallback, 
	successCallback, 
	errorCallback,
	attendanceStartedCallback,
	punchInCallback,
	punchOutCallback,}
){
  // console.log("attemting to connect");  
	const socket = io(hostSocket, {
		auth: {
			token: getItemWithExpiry('token')
		}
	})
console.log(socket);
	socket.on('punch_in',(data)=>{
		console.dir(' [socket] punch-in data:', data)
		punchInCallback(data)
	})
	socket.on('punch_out', (data)=>{
		console.dir('[socket] punch-out data:', data)
		punchOutCallback(data)
	})
	socket.on("new_message", (data) => {
		console.dir('[socket] new-message data:', data)
		newMessageCallback(data)
	})
	socket.on("connection", (data) => {
		console.dir(' [socket] connected..')
		connectionCallback(data)
	})
	socket.on("success", (data) => {
		if(!data || data?.message ) data.message = 'connection successful'
		console.dir('[socket] success message :', data)
		successCallback(data)
	})
	socket.on("error", (data) => {
		console.dir('[socket] error message :', data)
		errorCallback(data)
	})
	socket.on("AttendanceStarted", (data) => {
		console.dir('[socket] attendance started data : ', data)
		attendanceStartedCallback(data)
	})

	return {
		socket,
		sendMessage : (classroom_id, message)=>{
			socket.emit('new_message', {classroom_id, message})
		},
		startAttendance: (classroom_id, timeout=2)=>{
			socket.emit('start_attendance', {classroom_id, timeout})
		},
		joinClassRoom : (classroom_ids)=>{
			socket.emit('join_classroom',{classroom_ids})
		},
		punchIn : ({event_id,location, classroom_id})=>{
			console.dir(' [socket] punch-in data:', {event_id,location,classroom_id})
			socket.emit('punch_in',{event_id,location,classroom_id})
		},
		punchOut: ({event_id,location,classroom_id})=> {
			console.dir('[socket] punch-out data:', {event_id,location,classroom_id})
			socket.emit('punch_out', {event_id,location,classroom_id})
		}
	}
}

export async function handleEnroll(id) {
  try {
    const response = await makeSecureRequest(`/api/attendances/?event_id=${id}`, 'POST', {})
    console.log(response.message)
  } catch (error) {
    console.log(error.message)
  }
}

// console.dir(attendances)

export const fetchUserDetail = async () => {
	try {
		// get it from localStorage if available 
		const resSaved = getItemWithExpiry('user-details')
		console.log(resSaved)
		if (resSaved?.role ) return resSaved; 
		const res = makeSecureRequest('/api/auth/wmi', 'GET', {})
		// save it on local storage for later use 
		setItemWithExpiry('user-details',res,60*60*60*12) // save it for 12hrs 
		console.log(res.message)
		return res
	} catch (error) {
		console.error(error.message)
		return false
	}
}

export async function uploadFile(event, successCallback=(data)=>{console.log(data)}, errorCallback=(error)=>console.error(error)) {
	event.preventDefault();
	const formData = new FormData(event.target, event.submitter);
	try {
		const token = getItemWithExpiry("token");

		if (!token) {
			throw new Error("Log in/ Register to Perform This action");
		}
		const url = hostSocket + '/file/upload/';
		const method = 'POST';
		const response = await fetch(url, {
			method: method,
			headers: {
				// "Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			}, // set JWT token with Bearer prefix
			body: formData,
		});
		// check for errors :
		if (!response.ok) {
			const error_data = await response.json()
			throw new Error(error_data?.message);
		}
		// success :
		const data = await response.json()
		successCallback(data)
		return data;
	} catch (error) {
		// error :
		errorCallback(error)
		return null
	}
}
uploadFile.handler=(successCallback, errorCallback)=>{
	return function (event){
		uploadFile(event, successCallback, errorCallback)
	}
}

export const fetchEventById = async (id) => {
    const response = await fetch(`http://localhost:5600/api/events?event_id=${_id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch event data');
    }
    return await response.json(); // Assuming the API responds with JSON data
};
