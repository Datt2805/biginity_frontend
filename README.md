// ──────────────────────────────────────────────────────────────

// export async function uploadFile(event, successCallback=(data)=>{console.log(data)}, errorCallback=(error)=>console.error(error)) {
// 	event.preventDefault();
// 	const formData = new FormData(event.target, event.submitter);
// 	try {
// 		const token = getItemWithExpiry("token");

// 		if (!token) {
// 			throw new Error("Log in/ Register to Perform This action");
// 		}
// 		const url = hostSocket + '/file/upload/';
// 		const method = 'POST';
// 		const response = await fetch(url, {
// 			method: method,
// 			headers: {
// 				// "Content-Type": "multipart/form-data",
// 				Authorization: `Bearer ${token}`,
// 			}, // set JWT token with Bearer prefix
// 			body: formData,
// 		});
// 		// check for errors :
// 		if (!response.ok) {
// 			const error_data = await response.json()
// 			throw new Error(error_data?.message);
// 		}
// 		// success :
// 		const data = await response.json()
// 		successCallback(data)
// 		return data;
// 	} catch (error) {
// 		// error :
// 		errorCallback(error)
// 		return null
// 	}
// }
// uploadFile.handler=(successCallback, errorCallback)=>{
// 	return function (event){
// 		uploadFile(event, successCallback, errorCallback)
// 	}
// }