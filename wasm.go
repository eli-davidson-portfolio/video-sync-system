package main

import (
	"syscall/js"
)

func main() {
	c := make(chan struct{}, 0)
	js.Global().Set("getSecretMessage", js.FuncOf(getSecretMessage))
	<-c
}

func getSecretMessage(this js.Value, args []js.Value) interface{} {
	return "Hello from the server-side WebAssembly!"
}